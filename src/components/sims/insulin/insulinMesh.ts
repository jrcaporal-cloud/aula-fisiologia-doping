import * as THREE from 'three';

/** Insulina: proteína globular pequena (icosaedro facetado), âmbar como na aula. */
export const insulinGeometry = new THREE.IcosahedronGeometry(0.17, 0);

export const insulinMaterial = (): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ color: '#FBBF24', emissive: '#F59E0B', emissiveIntensity: 0.9, roughness: 0.35, flatShading: true });
