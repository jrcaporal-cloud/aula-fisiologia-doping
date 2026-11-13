import * as THREE from 'three';

/** Insulina: proteína globular pequena (icosaedro facetado), no ciano da insulina em toda a aula. */
export const insulinGeometry = new THREE.IcosahedronGeometry(0.17, 0);

export const insulinMaterial = (): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ color: '#67E8F9', emissive: '#22D3EE', emissiveIntensity: 0.9, roughness: 0.35, flatShading: true });
