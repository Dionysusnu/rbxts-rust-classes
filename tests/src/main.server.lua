-- Compiled with roblox-ts v1.1.1
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("include"):WaitForChild("RuntimeLib"))
local TestEZ = TS.import(script, TS.getModule(script, "testez").src)
local results = TestEZ.TestBootstrap:run({ game:GetService("ServerScriptService").tests })
if #results.errors > 0 or results.failureCount > 0 then
	error("Tests failed!")
end
