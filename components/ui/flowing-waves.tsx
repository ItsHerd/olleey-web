'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function FlowingWaves() {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const particleSystemRef = useRef<THREE.Points | null>(null);
    const constellationSystemRef = useRef<THREE.LineSegments | null>(null);
    const waveGroupRef = useRef<THREE.Group | null>(null);

    const mouse = useRef({ x: 0, y: 0 });
    const uniformsRef = useRef({
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(512, 512) },
        scrollProgress: { value: 0.0 }
    });

    // Create star texture
    function createStarTexture() {
        if (typeof document === 'undefined') return null;

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(200, 200, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(140, 140, 230, 0.5)');
        gradient.addColorStop(1, 'rgba(40, 40, 120, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    const starTextureRef = useRef<THREE.Texture | null>(null);

    // Aurora/Wave shader
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float iTime;
        
        void main() {
            vUv = uv;
            vPosition = position;
            
            // Wave displacement
            vec3 pos = position;
            float wave = sin(pos.x * 2.0 + iTime) * 0.3;
            wave += sin(pos.z * 1.5 - iTime * 0.8) * 0.2;
            pos.y += wave;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform float scrollProgress;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            vec2 uv = vUv;
            
            // Flowing aurora colors
            float wave1 = sin(uv.x * 3.0 + iTime * 0.5) * 0.5 + 0.5;
            float wave2 = sin(uv.y * 2.0 - iTime * 0.3) * 0.5 + 0.5;
            float wave3 = sin((uv.x + uv.y) * 2.5 + iTime * 0.4) * 0.5 + 0.5;
            
            // Aurora color palette
            vec3 color1 = vec3(0.1, 0.3, 0.8); // Blue
            vec3 color2 = vec3(0.3, 0.8, 0.6); // Cyan
            vec3 color3 = vec3(0.8, 0.2, 0.7); // Purple
            
            vec3 finalColor = mix(color1, color2, wave1);
            finalColor = mix(finalColor, color3, wave2);
            
            // Add shimmer
            float shimmer = wave3 * 0.3;
            finalColor += shimmer;
            
            // Fade edges
            float edgeFade = smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x);
            edgeFade *= smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
            
            gl_FragColor = vec4(finalColor * edgeFade, 0.6 + wave1 * 0.3);
        }
    `;

    // Create flowing particles
    function createFlowingParticles() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 3000;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Spread particles in a wave-like pattern
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

            // Flow velocities
            velocities[i * 3] = (Math.random() - 0.5) * 0.002;
            velocities[i * 3 + 1] = Math.random() * 0.001;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

            sizes[i] = Math.random() * 0.05 + 0.02;

            // Aurora colors
            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                colors[i * 3] = 0.1 + Math.random() * 0.2;
                colors[i * 3 + 1] = 0.3 + Math.random() * 0.3;
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
            } else if (colorChoice < 0.66) {
                colors[i * 3] = 0.3 + Math.random() * 0.2;
                colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
                colors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
            } else {
                colors[i * 3] = 0.8 + Math.random() * 0.2;
                colors[i * 3 + 1] = 0.2 + Math.random() * 0.2;
                colors[i * 3 + 2] = 0.7 + Math.random() * 0.3;
            }
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            map: starTextureRef.current,
            transparent: true,
            vertexColors: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        return new THREE.Points(particleGeometry, particleMaterial);
    }

    useEffect(() => {
        const mountElement = mountRef.current;
        if (!mountElement) return;

        // Initialize star texture
        if (!starTextureRef.current) {
            starTextureRef.current = createStarTexture();
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = null;
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 8);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        mountElement.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const canvas = renderer.domElement;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';

        // Create wave planes
        const waveGroup = new THREE.Group();
        scene.add(waveGroup);
        waveGroupRef.current = waveGroup;

        // Create multiple wave layers
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.PlaneGeometry(15, 8, 32, 32);
            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    ...uniformsRef.current,
                    iTime: { value: uniformsRef.current.iTime.value + i * 0.5 }
                },
                transparent: true,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            const wave = new THREE.Mesh(geometry, material);
            wave.position.z = -i * 2;
            wave.rotation.x = -0.3;
            waveGroup.add(wave);
        }

        // Particles
        const particleSystem = createFlowingParticles();
        scene.add(particleSystem);
        particleSystemRef.current = particleSystem;

        // Constellation lines
        const constellationMaterial = new THREE.LineBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        const constellationGeometry = new THREE.BufferGeometry();
        const constellationSystem = new THREE.LineSegments(constellationGeometry, constellationMaterial);
        scene.add(constellationSystem);
        constellationSystemRef.current = constellationSystem;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x4488ff, 1.5, 20);
        pointLight.position.set(0, 5, 5);
        scene.add(pointLight);

        // Mouse movement
        const handleMouseMove = (event: MouseEvent) => {
            mouse.current = {
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1
            };

            if (waveGroupRef.current) {
                gsap.to(waveGroupRef.current.rotation, {
                    y: mouse.current.x * 0.1,
                    x: -0.3 + mouse.current.y * 0.1,
                    duration: 1,
                    ease: 'power2.out'
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Resize handler
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        function animate(timestamp: number) {
            requestAnimationFrame(animate);

            const timeSeconds = timestamp * 0.001;
            uniformsRef.current.iTime.value = timeSeconds;

            // Update wave materials
            if (waveGroupRef.current) {
                waveGroupRef.current.children.forEach((child, index) => {
                    if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                        child.material.uniforms.iTime.value = timeSeconds + index * 0.5;
                    }
                });
            }

            // Animate particles
            if (particleSystemRef.current && constellationSystemRef.current) {
                const positions = particleSystemRef.current.geometry.attributes.position.array as Float32Array;
                const velocities = particleSystemRef.current.geometry.attributes.velocity.array as Float32Array;
                const connectedPoints: number[] = [];

                for (let i = 0; i < positions.length / 3; i++) {
                    const i3 = i * 3;

                    positions[i3] += velocities[i3];
                    positions[i3 + 1] += velocities[i3 + 1];
                    positions[i3 + 2] += velocities[i3 + 2];

                    // Wrap around
                    if (positions[i3] > 10) positions[i3] = -10;
                    if (positions[i3] < -10) positions[i3] = 10;
                    if (positions[i3 + 1] > 4) positions[i3 + 1] = -4;
                    if (positions[i3 + 2] > 7) positions[i3 + 2] = -7;
                    if (positions[i3 + 2] < -7) positions[i3 + 2] = 7;

                    // Create connections between nearby particles
                    if (i % 30 === 0) { // Only check every 30th particle for performance
                        for (let j = i + 1; j < Math.min(i + 100, positions.length / 3); j += 15) {
                            const j3 = j * 3;
                            const dx = positions[i3] - positions[j3];
                            const dy = positions[i3 + 1] - positions[j3 + 1];
                            const dz = positions[i3 + 2] - positions[j3 + 2];
                            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                            // Connect particles within distance threshold
                            if (distance < 1.5) {
                                connectedPoints.push(
                                    positions[i3], positions[i3 + 1], positions[i3 + 2],
                                    positions[j3], positions[j3 + 1], positions[j3 + 2]
                                );
                            }
                        }
                    }
                }

                particleSystemRef.current.geometry.attributes.position.needsUpdate = true;

                // Update constellation lines
                const constellationGeometry = constellationSystemRef.current.geometry;
                constellationGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectedPoints, 3));
                constellationGeometry.attributes.position.needsUpdate = true;
            }

            // Gentle rotation
            if (waveGroupRef.current) {
                waveGroupRef.current.rotation.y += 0.0003;
            }

            rendererRef.current?.render(scene, cameraRef.current!);
        }

        const animationFrameId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            mountElement.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0" />;
}
