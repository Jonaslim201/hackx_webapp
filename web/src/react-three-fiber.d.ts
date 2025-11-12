// src/react-three-fiber.d.ts
import '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: any;
      ambientLight: any;
      directionalLight: any;
    }
  }
}
