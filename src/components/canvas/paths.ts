import { CatmullRomCurve3, Vector3 } from 'three';
function loop(x1: number, z1: number, x2: number, z2: number, y: number) { return new CatmullRomCurve3([[x1+1,z1],[x2-1,z1],[x2,z1+1],[x2,z2-1],[x2-1,z2],[x1+1,z2],[x1,z2-1],[x1,z1+1]].map(([x,z]) => new Vector3(x,y,z)), true, 'catmullrom', 0.1); }
export const agvPath = loop(-19, 0, 18, 10, 0.4);
export const conveyorPath = loop(-13, 3.4, 12, 7.4, 1.3);

