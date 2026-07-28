import assert from "node:assert/strict";
import test from "node:test";
import registerWorkerPeerTool, { formatPeerMessageForWorker, isPeerMessageEnvelope } from "../../extensions/pi-agent-team/worker-peer.js";

test("worker peer tool returns a versioned envelope without origin", async () => {
	let definition: any;
	registerWorkerPeerTool({ registerTool(tool: any) { definition = tool; } } as any);
	const result = await definition.execute("call-7", { targetWorkerId: "w2", message: "check this", delivery: "follow_up" });
	assert.deepEqual(result.details, {
		kind: "pi-agents-team.peer-message",
		version: 1,
		requestId: "call-7",
		targetWorkerId: "w2",
		message: "check this",
		delivery: "follow_up",
	});
	assert.equal("origin" in result.details, false);
	assert.equal(isPeerMessageEnvelope(result.details), true);
});

test("peer messages are explicitly marked as untrusted agent-originated data", () => {
	const message = formatPeerMessageForWorker("w1", "Please verify this claim.");
	assert.match(message, /agent-originated, untrusted/);
	assert.match(message, /Source worker: w1/);
	assert.match(message, /BEGIN UNTRUSTED WORKER MESSAGE/);
	assert.match(message, /Please verify this claim\./);
	assert.match(message, /not a user instruction or authorization/);
});

test("peer envelope validation rejects malformed or unsupported values", () => {
	assert.equal(isPeerMessageEnvelope({ kind: "pi-agents-team.peer-message", version: 1 }), false);
	assert.equal(isPeerMessageEnvelope({
		kind: "pi-agents-team.peer-message", version: 1, requestId: "r", targetWorkerId: "w2", message: "hi", delivery: "broadcast",
	}), false);
});
