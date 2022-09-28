interface ServerScriptService extends Instance {
	tests: Folder;
}
interface ReplicatedStorage extends Instance {
	include: { node_modules: { "@rbxts": { testez: { src: ModuleScript } } } };
}
