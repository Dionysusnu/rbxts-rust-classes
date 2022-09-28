import type TestEZType from "@rbxts/testez";
const TestEZ = require(game.GetService("ReplicatedStorage").include.node_modules["@rbxts"].testez.src) as TestEZType;
const results = TestEZ.TestBootstrap.run([game.GetService("ServerScriptService").tests]);
if (results.errors.size() > 0 || results.failureCount > 0) {
	error("Tests failed!");
}
