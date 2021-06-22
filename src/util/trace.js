const { ACTION_TYPES, CALL_STATUS } = require('../CONST');
const Contract = require('../contract/Contract');
const { abi } = require('../contract/standard/error.json');

const errorContract = new Contract({ abi });

// Reorg an trace array in tree structure
function tracesInTree(txTrace) {
  const stack = [];
  const levelCalls = {};
  let maxLevel = 0;
  // eslint-disable-next-line guard-for-in
  for (const i in txTrace) {
    const t = txTrace[i];
    // set basic info
    t.index = i;
    t.level = 0;
    t.calls = [];

    if (t.type === ACTION_TYPES.CALL_RESULT || t.type === ACTION_TYPES.CREATE_RESULT) {
      // if the result is fail or reverted then decode the returnData
      if (t.action.outcome === CALL_STATUS.REVERTED) {
        const decoded = errorContract.abi.decodeData(t.action.returnData);
        t.action.decodedMessage = decoded.object.message;
      }
      if (t.action.outcome === CALL_STATUS.FAIL) {
        t.action.decodedMessage = Buffer.from(t.action.returnData.slice(2), 'hex').toString();
      }
      // set result
      const tp = stack.pop();
      txTrace[tp.index].result = t.action;
    } else {
      // set parent relation and invoke level
      if (stack.length > 0) {
        const ta = txTrace[stack[stack.length - 1].index];
        t.parent = ta.index;
        t.level = ta.level + 1;
        if (t.level > maxLevel) maxLevel = t.level;
      }
      //
      if (!levelCalls[t.level]) {
        levelCalls[t.level] = [];
      }
      levelCalls[t.level].push(t.index);
      // if is a  call or create push to stack top
      if (t.type === ACTION_TYPES.CALL || t.type === ACTION_TYPES.CREATE) {
        stack.push(t);
      }
    }
  }

  // eslint-disable-next-line no-plusplus
  for (let i = maxLevel; i > 0; i--) {
    for (const index of levelCalls[i]) {
      const item = txTrace[index];
      txTrace[item.parent].calls.push(item);
      _cleanTrace(item);
    }
  }
  return txTrace[0];
}

function _cleanTrace(trace) {
  delete trace.index;
  delete trace.level;
  delete trace.parent;
}

module.exports = {
  tracesInTree,
};
