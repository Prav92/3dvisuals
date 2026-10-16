# Warehouse asset pipeline
The current demo uses procedural meshes and instanced boxes. No authored GLB files have been supplied.
Export modular models from Blender as glTF 2.0 binary files here: warehouse_racks.glb, agv_robot.glb, conveyor_module.glb.
Generate typed components with:
npm run models:jsx -- public/models/agv_robot.glb --types --transform
Review generated dimensions/materials, then replace the matching procedural component. gltfjsx --transform optimizes assets; validate results visually and measure actual transfer sizes. No fixed compression ratio is guaranteed.
Use drei useGLTF with Draco or Meshopt decoding as appropriate to the exported file; self-host decoders for offline installations.

