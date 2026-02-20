"use client";

import { useRef, useCallback } from "react";

// TODO: Optionally encapsulate Matter.js Engine/World creation and fragment body creation
// TODO: Return { engine, world, setRotation } or integrate into PhysicsCanvas only
// TODO: Used by PhysicsCanvas or BlendContainer to drive simulation

export function usePhysics() {
  const engineRef = useRef<unknown>(null);

  const setRotation = useCallback((_deg: number) => {
    // TODO: Apply rotation to container body or world gravity
  }, []);

  return { engineRef, setRotation };
}
