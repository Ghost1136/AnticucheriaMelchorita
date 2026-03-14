document.addEventListener("DOMContentLoaded", () => {
    const scene = document.getElementById('anticucho-scene');
    const stickyEl = document.querySelector('.anticucho-sticky');
    const skewer = document.getElementById('skewer');
    const plate = document.getElementById('plate');
    const plateShadow = document.getElementById('plate-shadow');
    const sceneText = document.getElementById('scene-text');
    const vaporContainer = document.getElementById('vapor-particles');

    if (!scene || !stickyEl || !skewer || !plate) {
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

    function updatePinning() {
        const rect = scene.getBoundingClientRect();
        const sceneHeight = scene.offsetHeight;
        const viewportHeight = window.innerHeight;

        if (rect.top <= 0 && rect.bottom > viewportHeight) {
            // Scene is in view and there's scroll room: PIN it
            stickyEl.style.position = 'fixed';
            stickyEl.style.top = '0';
            stickyEl.style.left = '0';
            stickyEl.style.right = '0';
            stickyEl.style.width = '100%';
        } else if (rect.bottom <= viewportHeight) {
            // Past the scene: place at bottom
            stickyEl.style.position = 'absolute';
            stickyEl.style.top = (sceneHeight - viewportHeight) + 'px';
            stickyEl.style.left = '0';
            stickyEl.style.right = '0';
            stickyEl.style.width = '100%';
        } else {
            // Before the scene: place at top
            stickyEl.style.position = 'absolute';
            stickyEl.style.top = '0';
            stickyEl.style.left = '0';
            stickyEl.style.right = '0';
            stickyEl.style.width = '100%';
        }
    }

    function updateAnimation() {
        const progress = getProgress();
        const viewportHeight = window.innerHeight;

        // Pin the viewport
        updatePinning();

        // ---- SKEWER: falls from top toward plate ----
        const startOffset = -viewportHeight * 0.35;
        const endOffset = viewportHeight * 0.08;
        const currentOffset = startOffset + (endOffset - startOffset) * easeOutQuart(progress);
        const rotation = -25 + 20 * easeOutCubic(progress);
        const scale = 0.55 + 0.45 * easeOutCubic(progress);

        skewer.style.transform = `translate(-50%, -50%) translateY(${currentOffset}px) rotate(${rotation}deg) scale(${scale})`;

        // ---- PLATE SHADOW ----
        if (plateShadow) {
            const shadowProgress = easeOutCubic(progress);
            const shadowScale = 0.3 + 0.7 * shadowProgress;
            plateShadow.style.transform = `translateX(-50%) scale(${shadowScale})`;
            plateShadow.style.opacity = 0.1 + 0.6 * shadowProgress;
        }

        // ---- PLATE: subtle settle ----
        if (progress > 0.9) {
            const landProgress = (progress - 0.9) / 0.1;
            const settle = 1 + 0.02 * Math.sin(landProgress * Math.PI);
            plate.style.transform = `translateX(-50%) scale(${settle})`;
        } else {
            plate.style.transform = 'translateX(-50%) scale(1)';
        }

        // ---- TEXT ----
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

        // ---- VAPOR ----
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
    window.addEventListener('resize', () => requestAnimationFrame(updateAnimation));
    requestAnimationFrame(updateAnimation);

    // ---- Easing functions ----
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
});
