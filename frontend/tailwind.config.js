export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                main: '#f5f3ef',
                panel: '#ffffff',
                panelHover: '#f8f9fa',
                line: '#e5e7eb',
                accent: '#0d765f',
                accentHover: '#0a5c4a',
                accentOrange: '#f59e0b',
                textMain: '#1c1c1c',
                textMuted: '#6b7280'
            },
            boxShadow: {
                'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
                'inner-soft': 'inset 0 2px 4px 0 rgba(0,0,0,0.02)'
            }
        }
    },
    plugins: []
};
