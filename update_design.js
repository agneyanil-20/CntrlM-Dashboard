const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf-8');

// Replace CSS Variables
css = css.replace(/:root\s*\{[\s\S]*?\}/, `:root {
    --primary: #FF6A00; /* Soft Orange */
    --primary-light: #FFF0E6;
    --primary-glow: rgba(255, 106, 0, 0.15);
    --secondary: #0F3F41;
    --bg-main: #F7F9FB;
    --text-main: #1A1A1A;
    --text-muted: #6B7280;
    --glass-bg: #FFFFFF;
    --glass-border: #EAECEF;
    --radius-lg: 16px;
    --radius-md: 14px;
    --shadow-premium: 0 4px 20px rgba(0,0,0,0.04);
}`);

// Hide blobs to reduce clutter
css = css.replace(/\.blob\s*\{[\s\S]*?\}/, `.blob { display: none; }`);

// Replace fonts
css = css.replace(/font-family:\s*'Poppins',\s*sans-serif;/g, `font-family: 'Inter', sans-serif;`);

// Soft shadows
css = css.replace(/0 10px 30px -10px rgba\(0,0,0,0\.05\)/g, `var(--shadow-premium)`);
css = css.replace(/box-shadow: 0 4px 6px -1px rgba\(0,0,0,0\.02\)/g, `box-shadow: var(--shadow-premium)`);
css = css.replace(/box-shadow: 0 20px 25px -5px rgba\(0,0,0,0\.05\)/g, `box-shadow: 0 8px 30px rgba(0,0,0,0.08)`);

// Glass effect should be plain white with subtle border
css = css.replace(/backdrop-filter: blur\(12px\);/g, `/* removed backdrop filter for clean look */`);

// Progress bar gradient updates
css = css.replace(/linear-gradient\(90deg, #f97316, #fb923c\)/g, `linear-gradient(90deg, #FF6A00, #FFAE73)`);

// Primary button gradient
css = css.replace(/linear-gradient\(135deg, #f97316, #fcd34d\)/g, `#FF6A00`);
css = css.replace(/linear-gradient\(135deg, #f97316, #fb923c\)/g, `#FF6A00`);
css = css.replace(/box-shadow: 0 10px 15px -3px rgba\(249, 115, 22, 0\.3\)/g, `box-shadow: 0 4px 15px rgba(255, 106, 0, 0.2)`);
css = css.replace(/box-shadow: 0 15px 20px -5px rgba\(249, 115, 22, 0\.4\)/g, `box-shadow: 0 6px 20px rgba(255, 106, 0, 0.3)`);

// Update KPI icon colors to match subtle tones (green, orange, blue)
css = css.replace(/\.kpi-icon\.blue \{ background: #eff6ff; color: #3b82f6; \}/g, `.kpi-icon.blue { background: #F0F4F8; color: #0F3F41; }`);
css = css.replace(/\.kpi-icon\.green \{ background: #f0fdf4; color: #22c55e; \}/g, `.kpi-icon.green { background: #E8F5E9; color: #2E7D32; }`);
css = css.replace(/\.kpi-icon\.yellow \{ background: #fffbeb; color: #f59e0b; \}/g, `.kpi-icon.yellow { background: #FFF3E0; color: #E65100; }`);

fs.writeFileSync('styles.css', css);
console.log('Updated styles.css with premium UI');
