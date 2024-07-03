// ==UserScript==
// @name         MathJax Renderer for Claude with Draggable Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Render LaTeX math formulas on Claude's interface using MathJax with a draggable button
// @match        https://claude.ai/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to load MathJax
    function loadMathJax() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-AMS_CHTML';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Configure MathJax
    window.MathJax = {
        tex2jax: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true
        },
        CommonHTML: { linebreaks: { automatic: true } },
        "HTML-CSS": { linebreaks: { automatic: true } },
        SVG: { linebreaks: { automatic: true } },
        messageStyle: 'none'
    };

    // Function to render MathJax
    function renderMathJax() {
        if (window.MathJax && window.MathJax.Hub) {
            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
        }
    }

    // Create and style the render button
    function createRenderButton() {
        const button = document.createElement('button');
        button.textContent = 'Render LaTeX';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            border: 2px solid #333;
            background-color: rgba(255, 255, 255, 0.4);
            cursor: move;
            transition: background-color 0.3s, transform 0.1s;
            user-select: none;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        });

        button.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only react to left mouse button
            button.style.transform = 'scale(0.95)';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });

        button.addEventListener('click', renderMathJax);

        makeDraggable(button);

        document.body.appendChild(button);
    }

    // Function to make an element draggable
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // Call a function whenever the cursor moves
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Set the element's new position
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.bottom = 'auto';
            element.style.right = 'auto';
        }

        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Function to initialize the script
    async function init() {
        try {
            await loadMathJax();
            createRenderButton();
            renderMathJax(); // Initial render
            // Set up a MutationObserver to watch for new content
            const observer = new MutationObserver(renderMathJax);
            observer.observe(document.body, { childList: true, subtree: true });
        } catch (error) {
            console.error('Failed to initialize MathJax:', error);
        }
    }

    // Run the initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
