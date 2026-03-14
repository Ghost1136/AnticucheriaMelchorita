document.addEventListener("DOMContentLoaded", () => {
    const scene = document.getElementById('anticucho-scene');
    const skewer = document.getElementById('skewer');
    const plate = document.getElementById('plate');
    const plateShadow = document.getElementById('plate-shadow');
    const sceneText = document.getElementById('scene-text');
    const vaporContainer = document.getElementById('vapor-particles');

    if (!scene || !skewer || !plate) {
        console.warn('Anticucho animation: missing elements');
        return;
    }

    // Create vapor particles
    if (vaporContainer) {
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.classList.add('vapor-particle');
            particle.style.left = `${15 + Math.random() * 70}%`;
            particle.style.animationDelay = `${Math.random() * 3}s`;
            particle.style.animationDuration = `${2.5 + Math.random() * 2}s`;
            vaporContainer.appendChild(particle);
        }
    }

    let ticking = false;

    function getProgress() {
        const rect = scene.getBoundingClientRect();
        const sceneHeight = scene.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrolled = -rect.top;
        const totalScroll = sceneHeight - viewportHeight;
        return Math.max(0, Math.min(1, scrolled / totalScroll));
    }

    function updateAnimation() {
        const progress = getProgress();
        const viewportHeight = window.innerHeight;

        // ---- SKEWER: Calculate end position dynamically based on plate ----
        // The plate is at bottom: 8% of the viewport, so its center is roughly at:
        // viewport bottom - 8% - half plate height ≈ 75-80% of viewport from top
        // Skewer CSS is at top:50%, so offset needed = plateCenter - 50% of vh
        
        // Start: skewer way above (near top of viewport)
        const startOffset = -viewportHeight * 0.42;
        // End: skewer centered on the plate (plate is at ~bottom 8%, center ~bottom 25%)
        // From center (50%): need to go to ~75% = +25% of vh = +0.15vh
        const endOffset = viewportHeight * 0.12;
        
        // Use easeOutCubic for smoother, more natural landing (no hard bounce)
        const currentOffset = startOffset + (endOffset - startOffset) * easeOutQuart(progress);
        
        // Rotation: starts tilted, gently straightens
        const rotation = -25 + 20 * easeOutCubic(progress);
        
        // Scale: starts smaller, grows
        const scale = 0.55 + 0.45 * easeOutCubic(progress);

        skewer.style.transform = `translate(-50%, -50%) translateY(${currentOffset}px) rotate(${rotation}deg) scale(${scale})`;

        // ---- PLATE SHADOW: warm glow grows ----
        if (plateShadow) {
            const shadowProgress = easeOutCubic(progress);
            const shadowScale = 0.3 + 0.7 * shadowProgress;
            plateShadow.style.transform = `translateX(-50%) scale(${shadowScale})`;
            plateShadow.style.opacity = 0.1 + 0.6 * shadowProgress;
        }

        // ---- PLATE: gentle settle on landing ----
        if (progress > 0.9) {
            const landProgress = (progress - 0.9) / 0.1;
            const settle = 1 + 0.02 * Math.sin(landProgress * Math.PI);
            plate.style.transform = `translateX(-50%) scale(${settle})`;
        } else {
            plate.style.transform = 'translateX(-50%) scale(1)';
        }

        // ---- TEXT: fades in during last portion ----
        if (sceneText) {
            if (progress > 0.55) {
                const textP = easeOutCubic((progress - 0.55) / 0.45);
                sceneText.style.opacity = textP;
                sceneText.style.transform = `translateY(${30 * (1 - textP)}px)`;
            } else {
                sceneText.style.opacity = '0';
                sceneText.style.transform = 'translateY(30px)';
            }
        }

        // ---- VAPOR: appears during second half ----
        if (vaporContainer) {
            if (progress > 0.45) {
                vaporContainer.style.opacity = Math.min(1, (progress - 0.45) / 0.3);
            } else {
                vaporContainer.style.opacity = '0';
            }
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateAnimation);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(updateAnimation);

    // ---- Easing functions ----
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Smoother than bounce, elegant deceleration
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
});
