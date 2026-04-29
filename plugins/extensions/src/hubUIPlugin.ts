import { IPlugin, PluginRenderProps, PluginClass } from './pluginSystem';

export class HubUIPlugin implements IPlugin {
  id = 'hub-ui';
  name = 'PATH Hub';
  version = '2.0.0';
  class = PluginClass.UI;
  description = 'Hub interface for PATH# - main control center';
  author = 'PATH# Team';
  metadata = {
    name: 'PATH Hub',
    version: '2.0.0',
    class: PluginClass.UI,
    moduleId: 'hub-module',
    requiredAPIs: ['state-v1', 'commands-v1', 'events-v1', 'tabs-v1', 'modules-v1'],
    dependencies: ['path-module', 'node-module']
  };

  async render(props: PluginRenderProps): Promise<string> {
    console.log('[HubUIPlugin] render() called, props:', props);
    const { state } = props;
    const paths = state.paths || [];
    console.log('[HubUIPlugin] Generating HTML for', paths.length, 'paths');
    const recentPaths = paths.slice(-5).reverse();

    const formatDateShort = (dateString?: string) => {
      if (!dateString) return '--/--/--';
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return '--/--/--';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    };

    const previewPlaceholderSvg = `
      <svg class="preview-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
        <path d="M7 14l3-3 4 4 3-3 3 3" />
        <circle cx="9" cy="9" r="1.5" />
      </svg>
    `;
    const previewPlaceholderHtml = `<div class="path-preview-placeholder">${previewPlaceholderSvg}</div>`;

    const buildPreviewStyle = (meta?: any) => {
      const safe = meta && typeof meta === 'object' ? meta : {};
      const x = typeof safe.x === 'number' ? safe.x : 50;
      const y = typeof safe.y === 'number' ? safe.y : 50;
      const scale = typeof safe.scale === 'number' ? safe.scale : 1;
      return `object-position:${x}% ${y}%;transform:scale(${scale});transform-origin:${x}% ${y}%;`;
    };

    const pathCards = recentPaths
      .map((path: any) => {
        const nodeCount = path.nodes?.length || 0;
        const title = path.title || 'Untitled Path';
        const created = formatDateShort(path.createdAt);
        const previewUrl = path.previewUrl || path.preview || '';
        const previewMeta = path.previewMeta || null;
        return `
          <a class="path-card" href="/ui/open-path/${path.id}" data-path-id="${path.id}">
            <div class="path-preview${previewUrl ? ' has-image' : ''}">
              ${previewUrl ? `<img src="${previewUrl}" alt="" style="${buildPreviewStyle(previewMeta)}" onload="this.parentElement.classList.add('has-image')" onerror="this.parentElement.classList.remove('has-image'); this.remove()" />${previewPlaceholderHtml}` : previewPlaceholderHtml}
            </div>
            <div class="path-card-header">
              <div class="path-title">${title}</div>
              <div class="path-meta">${created}</div>
            </div>
          </a>
        `;
      })
      .join('');

    const stateJson = JSON.stringify(state).replace(/</g, '\\u003c');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PATH Hub</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg width='6528' height='2990' viewBox='0 0 6528 2990' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5280.91 780.463C5191.43 781.559 5186.76 782.104 5153.58 795.381C5103.29 815.507 5066.17 848.104 5039.07 895.927C5022.86 924.543 5013.08 954.871 5009.68 987.067C5008.47 998.499 5008.04 1152.59 5008.37 1457.51L5008.86 1910.96L5015.36 1885.2C5026.66 1840.44 5044.71 1807.58 5074.4 1777.77C5101.9 1750.16 5120.18 1737.82 5149.64 1726.97C5181.6 1715.19 5189.22 1714.36 5271.51 1713.58L5345.89 1712.89L5349.43 1695.32C5352.65 1679.33 5359.8 1647.75 5384.51 1540.43C5397.83 1482.53 5411.84 1417.79 5413.1 1408.28L5414.24 1399.64L5216.06 1400.18C5090.28 1400.52 5017.28 1400.11 5016.22 1399.05C5014.52 1397.35 5047.68 1360.26 5061.4 1348.52C5065.18 1345.29 5092.22 1319.32 5121.48 1290.82C5215.09 1199.64 5219.51 1196.17 5259.97 1182.13C5295.01 1169.96 5306.83 1168.67 5393.95 1167.49L5471.59 1166.44L5475.72 1149.17C5478 1139.67 5484.03 1114.79 5489.14 1093.89C5494.25 1072.99 5501.99 1039.56 5506.36 1019.61C5510.72 999.661 5520.38 957.685 5527.82 926.333C5550.09 832.484 5560.72 785.556 5560.72 781.104C5560.72 778.89 5433.51 778.598 5280.91 780.463ZM5933.41 779.935L5793.96 780.387L5793.1 784.264C5789.46 800.703 5773.27 870.187 5764.83 905.604C5755.54 944.566 5744.24 994.517 5735.11 1036.89C5728.29 1068.51 5714.19 1130.71 5709.9 1148C5707.47 1157.81 5705.78 1166.13 5706.15 1166.49C5706.51 1166.85 5774.79 1167.26 5857.88 1167.39L6008.95 1167.64L6010.21 1162.72C6010.9 1160.02 6015.35 1139.93 6020.08 1118.08C6030.47 1070.11 6038.11 1036.44 6042.59 1018.86C6046.36 1004.1 6060.79 939.534 6064.44 921.151C6067.7 904.744 6076.6 865.502 6080.9 848.599C6082.84 840.999 6086.91 822.626 6089.95 807.772L6095.47 780.766L6086.75 779.717C6081.96 779.14 6076.87 778.852 6075.45 779.076C6074.02 779.299 6010.1 779.686 5933.41 779.935ZM6327.02 792.89C6325.45 798.829 6322.6 810.683 6320.67 819.233C6318.75 827.784 6314.86 844.108 6312.01 855.509C6309.16 866.91 6301.01 903.056 6293.88 935.833C6279.96 999.86 6276.03 1017.25 6256.2 1102.53C6249.13 1132.93 6242.86 1160.14 6242.26 1162.99L6241.18 1168.17L6384.15 1167.72L6527.12 1167.27L6527.08 1072.71C6527.03 981.511 6526.89 977.604 6523.26 962.608C6509.58 906.191 6482.38 863.562 6438.17 829.237C6413.09 809.765 6386.95 796.601 6355.07 787.39C6329.78 780.085 6330.43 779.959 6327.02 792.89ZM6522.43 1210.67C6519.24 1232.59 6510.52 1261.17 6501.33 1279.83C6482.66 1317.73 6441.41 1358.06 6401.09 1377.83C6361.97 1397.01 6350.88 1398.74 6259.06 1400.01L6186.18 1401.01L6182.54 1416.74C6180.53 1425.39 6175.47 1448.79 6171.3 1468.74C6161.4 1516.1 6146.66 1581.15 6125.47 1670.85C6121.43 1687.95 6118.04 1704.24 6117.94 1707.05L6117.76 1712.16L6309.49 1712.04C6414.94 1711.98 6506.02 1711.36 6511.89 1710.66C6522.47 1709.41 6522.55 1709.43 6521.52 1713.44C6520.46 1717.55 6342.93 1894.87 6325.56 1909.17C6314.09 1918.61 6292.45 1929 6271.48 1935.13C6244.45 1943.03 6225.75 1944.55 6152.31 1944.82C6115.26 1944.96 6079.58 1945.56 6073.02 1946.15L6061.09 1947.23L6054.49 1976.6C6050.86 1992.75 6045.17 2017.24 6041.84 2031.01C6036.01 2055.13 6019.58 2127.42 6008.09 2179.57C6005.05 2193.34 5996.32 2230.66 5988.69 2262.48C5981.05 2294.31 5974.45 2323.18 5974.01 2326.63L5973.21 2332.92L6009.18 2334.2C6028.96 2334.91 6106.96 2335.05 6182.5 2334.51C6310.39 2333.61 6320.99 2333.3 6336.39 2330.12C6441.02 2308.51 6515.06 2226.58 6526.33 2119.97C6528.4 2100.37 6528.63 1220.9 6526.57 1201.85L6525.35 1190.63L6522.43 1210.67ZM5762.38 1400.07C5698.97 1400.33 5647.09 1400.91 5647.09 1401.36C5647.09 1401.82 5643.55 1419.5 5639.22 1440.65C5634.89 1461.8 5629.84 1486.74 5627.98 1496.08C5622.96 1521.33 5613.05 1565.84 5606.57 1592.25C5603.42 1605.08 5598.73 1624.9 5596.14 1636.3C5593.55 1647.7 5588.53 1669.29 5584.97 1684.29C5581.23 1700.02 5579.17 1711.97 5580.11 1712.54C5582.43 1713.98 5882.64 1711.53 5883.83 1710.07C5884.38 1709.4 5888.09 1693.69 5892.08 1675.16C5896.07 1656.64 5903.94 1620.1 5909.56 1593.98C5915.19 1567.85 5923.38 1531.7 5927.76 1513.65C5939.87 1463.82 5947.54 1430.13 5949.38 1418.64C5950.3 1412.94 5951.53 1406.14 5952.13 1403.53L5953.21 1398.78L5915.44 1399.2C5894.67 1399.43 5825.79 1399.82 5762.38 1400.07ZM5008.03 2030.58C5008.07 2121.29 5008.99 2135.73 5016.59 2164.44C5026.35 2201.3 5043.62 2230.34 5074.44 2261.7C5097.73 2285.41 5129.12 2306.31 5157.47 2316.98C5175.2 2323.66 5200.24 2330.03 5201.96 2328.31C5203.93 2326.34 5211.4 2296.63 5224.82 2237.44C5230.85 2210.83 5240.9 2166.92 5247.16 2139.84C5264.37 2065.39 5291.27 1946.71 5291.27 1945.24C5291.27 1944.91 5227.53 1944.64 5149.64 1944.64H5008L5008.03 2030.58ZM5534.38 1945.92C5527.97 1946.25 5522.72 1946.77 5522.72 1947.07C5522.72 1949.79 5512.31 1997.3 5503.76 2033.6C5497.94 2058.3 5488.55 2099.11 5482.89 2124.29C5477.23 2149.47 5470.35 2179.78 5467.61 2191.66C5464.87 2203.54 5459 2229.58 5454.56 2249.53C5450.13 2269.48 5444.61 2294.02 5442.29 2304.06C5439.98 2314.11 5438.09 2324.67 5438.09 2327.53V2332.75L5497.96 2333.89C5573.82 2335.34 5715.86 2335.38 5729.5 2333.95L5739.88 2332.87L5743.55 2317.11C5745.57 2308.44 5750.34 2287.75 5754.16 2271.12C5757.98 2254.49 5762.23 2236.62 5763.62 2231.39C5766.38 2221 5777.67 2172.19 5788.59 2123.43C5792.42 2106.33 5800.67 2070.57 5806.92 2043.97C5816.97 2001.21 5828.28 1949.58 5828.4 1945.94C5828.45 1944.69 5558.35 1944.68 5534.38 1945.92Z' fill='white'/%3E%3Cpath d='M90 2200V912H754C859.333 912 946 933.333 1014 976C1083.33 1017.33 1134.67 1074 1168 1146C1201.33 1218 1218 1298 1218 1386C1218 1476.67 1198.67 1557.33 1160 1628C1121.33 1698.67 1066.67 1754 996 1794C925.333 1834 842 1854 746 1854H466V2200H90ZM466 1566H660C718.667 1566 762 1549.33 790 1516C819.333 1482.67 834 1439.33 834 1386C834 1328.67 820.667 1283.33 794 1250C767.333 1216.67 726 1200 670 1200H466V1566ZM1118.36 2200L1612.36 912H2010.36L2504.36 2200H2112.36L2004.36 1926H1616.36L1510.36 2200H1118.36ZM1666.36 1656H1954.36L1810.36 1278L1666.36 1656ZM2756.77 2200V1192H2394.77V912H3494.77V1192H3132.77V2200H2756.77ZM3593.91 2200V912H3969.91V1392H4413.91V912H4789.91V2200H4413.91V1720H3969.91V2200H3593.91Z' fill='white'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d0d0d;
      --sidebar: #141414;
      --panel: #1a1a1a;
      --text: #e5e5e5;
      --text-muted: #8c8c8c;
      --text-subtle: #5a5a5a;
      --accent: #4a9eff;
      --accent-soft: #3b7ec9;
      --border: #252525;
      --border-subtle: #1f1f1f;
      --card-bg: #1a1a1a;
      --card-hover: #202020;
      --radius: 10px;
      --spacing: 16px;
      --status-green: #52c41a;
      --status-yellow: #faad14;
      --status-gray: #434343;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* SVG noise filter definition */
    svg.noise-filter {
      position: absolute;
      width: 0;
      height: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      position: relative;
      transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Логотип PATH# - автоматическая смена цвета */
    body.theme-light .sidebar-header img,
    body.theme-light svg path {
      filter: brightness(0) saturate(100%) invert(7%) sepia(8%) saturate(4456%) hue-rotate(186deg) brightness(95%) contrast(93%);
    }
    
    body.theme-dark .sidebar-header img,
    body.theme-dark svg path {
      filter: none;
    }
    
    /* Light theme - мягкие тени вместо жёстких границ */
    body.theme-light .card-bg,
    body.theme-light .path-card,
    body.theme-light .create-card,
    body.theme-light .achievement-card,
    body.theme-light .settings-section {
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    }
    
    body.theme-light .path-card:hover,
    body.theme-light .create-card:hover,
    body.theme-light .achievement-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
    }
    
    /* Light theme - глубина для панелей */
    body.theme-light .sidebar,
    body.theme-light .topbar {
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);
    }
    
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: 
        radial-gradient(circle at 50% 20%, rgba(74, 158, 255, 0.05) 0%, transparent 50%),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
    }
    
    /* Light theme - еле заметный шум */
    body.theme-light::before {
      background: 
        radial-gradient(circle at 50% 20%, rgba(74, 158, 255, 0.03) 0%, transparent 50%),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E");
    }

    .app {
      display: grid;
      grid-template-columns: 220px 1fr;
      min-height: 100vh;
      position: relative;
      z-index: 1;
      pointer-events: auto;
    }

    .sidebar {
      background: var(--sidebar);
      border-right: 1px solid var(--border);
      padding: 32px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .sidebar-header {
      padding: 12px 16px 32px;
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.5px;
    }

    .nav-item {
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 500;
      padding: 10px 16px;
      border-radius: var(--radius);
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    
    .nav-item svg {
      width: 18px;
      height: 18px;
      stroke-width: 2;
      opacity: 0.7;
      transition: opacity 0.15s ease;
    }
    
    .nav-item::after {
      content: '';
      position: absolute;
      right: 12px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--status-gray);
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    
    .nav-item[data-nav="home"]::after,
    .nav-item[data-nav="node"]::after {
      opacity: 1;
      background: var(--status-green);
    }

    .nav-item.active {
      color: var(--text);
      background-color: var(--panel);
      padding: 10px 20px;
      margin-left: -4px;
    }
    
    /* Light theme - акцентная подсветка активной навигации */
    body.theme-light .nav-item.active {
      background: linear-gradient(90deg, rgba(74, 158, 255, 0.08) 0%, rgba(74, 158, 255, 0.04) 100%);
      border-left: 3px solid var(--accent);
      padding-left: 17px;
    }
    
    .nav-item.active svg {
      opacity: 1;
    }

    .nav-item:not(.active):hover {
      background-color: var(--panel);
      color: var(--text);
    }
    
    /* Light theme - мягкий hover */
    body.theme-light .nav-item:not(.active):hover {
      background-color: rgba(74, 158, 255, 0.04);
    }
    
    .nav-item:not(.active):hover svg {
      opacity: 1;
    }

    .main {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .topbar {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid var(--border);
      background: var(--sidebar);
      color: var(--text-subtle);
      text-transform: uppercase;
    }

    .topbar-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .topbar-title {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      color: var(--text-subtle);
    }

    .topbar-subtitle {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.6px;
      color: var(--text-muted);
      text-transform: none;
    }

    .content {
      flex: 1;
      padding: 64px 80px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      position: relative;
      z-index: 1;
      pointer-events: auto;
    }

    .hero-block {
      margin-bottom: 56px;
      text-align: center;
    }
    
    .hero-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 12px;
      letter-spacing: -0.3px;
    }
    
    .hero-subtitle {
      font-size: 13px;
      color: var(--text-subtle);
      line-height: 1.6;
      margin-bottom: 32px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .hero-philosophy {
      font-size: 11px;
      color: var(--text-subtle);
      font-style: italic;
      padding: 12px 20px;
      border-left: 2px solid var(--border);
      background: var(--panel);
      border-radius: var(--radius);
      max-width: 480px;
      margin: 0 auto;
      text-align: left;
      line-height: 1.5;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-subtle);
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 32px;
      align-items: start;
      pointer-events: auto;
    }

    .create-card, .path-card {
      background: var(--card-bg);
      border-radius: var(--radius);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .create-card:hover, .path-card:hover {
      border-color: var(--border);
      transform: translateY(-2px);
    }
    
    /* Light theme - elevation для карточек */
    body.theme-light .create-card,
    body.theme-light .path-card {
      border: 1px solid rgba(0, 0, 0, 0.06);
    }
    
    body.theme-light .create-card:hover,
    body.theme-light .path-card:hover {
      border-color: rgba(74, 158, 255, 0.2);
      background: #FEFEFE;
    }

    .create-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 12px;
      color: var(--text-muted);
      font-weight: 500;
      font-size: 14px;
      position: relative;
      padding: 24px;
    }
    
    .create-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, var(--accent) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .create-card:hover::before {
      opacity: 0.05;
    }
    
    .create-card svg {
      width: 48px;
      height: 48px;
      stroke: var(--accent-soft);
      stroke-width: 1.5;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }
    
    .create-card:hover svg {
      stroke: var(--accent);
      transform: scale(1.08);
    }
    
    .create-card-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
    }
    
    .create-card-subtitle {
      font-size: 12px;
      color: var(--text-subtle);
      text-align: center;
      line-height: 1.4;
    }

    .path-card {
      display: flex;
      flex-direction: column;
      min-height: 200px;
    }

    .path-preview {
      flex-grow: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--panel);
      padding: 0;
      min-height: 120px;
      overflow: hidden;
    }

    .path-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transform-origin: 50% 50%;
    }

    .path-preview img + .path-preview-placeholder {
      display: none;
    }

    .path-preview.has-image .path-preview-placeholder {
      display: none;
    }

    .path-preview-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-subtle);
      background: linear-gradient(135deg, rgba(74, 158, 255, 0.08), rgba(0, 0, 0, 0));
    }

    .preview-placeholder-icon {
      width: 48px;
      height: 48px;
      opacity: 0.6;
    }

    .preview-editor-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 160;
    }

    .preview-editor-backdrop.open {
      display: flex;
    }

    .preview-editor {
      width: 100%;
      max-width: 560px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .preview-editor-canvas {
      width: 100%;
      height: 260px;
      border-radius: 12px;
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      overflow: hidden;
      position: relative;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-editor-canvas.dragging {
      cursor: grabbing;
    }

    .preview-editor-canvas img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform-origin: 50% 50%;
    }

    .preview-editor-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--text-muted);
    }

    .preview-editor-controls input[type="range"] {
      flex: 1;
    }
    
    .path-preview svg {
      width: 100%;
      height: 100%;
      max-height: 60px;
      opacity: 0.6;
      transition: opacity 0.2s ease;
    }
    
    .path-card:hover .path-preview svg {
      opacity: 0.9;
    }

    .path-card-header {
      padding: 16px 18px;
      font-size: 14px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .path-title {
      font-weight: 600;
      color: var(--text);
    }

    .path-meta {
      color: var(--text-subtle);
      font-size: 11px;
      font-weight: 500;
    }

    .path-context-menu {
      position: fixed;
      min-width: 160px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      padding: 6px;
      display: none;
      z-index: 120;
    }

    .path-context-menu.open {
      display: block;
    }

    .path-context-item {
      width: 100%;
      background: transparent;
      border: none;
      color: var(--text);
      text-align: left;
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .path-context-item:hover {
      background: var(--card-hover);
    }

    .path-context-item.danger {
      color: #ff6b6b;
    }

    .path-context-separator {
      height: 1px;
      background: var(--border-subtle);
      margin: 6px 4px;
    }

    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 10, 10, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 16px;
      z-index: 200;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    body.loading .loading-overlay {
      opacity: 1;
      pointer-events: auto;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.15);
      border-top-color: var(--accent);
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      font-size: 12px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .view {
      display: none;
    }

    .view.active {
      display: block;
      animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .node-view-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .node-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.3px;
      text-transform: uppercase;
    }

    .node-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 6px;
      text-transform: none;
      letter-spacing: 0.2px;
    }

    .node-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 28px;
      align-items: start;
    }

    .node-filters {
      background: rgba(26, 26, 26, 0.6);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius);
      padding: 18px 16px;
      color: var(--text-muted);
      font-size: 12px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 22px;
    }

    .filter-group:last-child {
      margin-bottom: 0;
    }

    .filter-title {
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 1px;
      color: var(--text-subtle);
    }

    .filter-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .filter-item {
      font-size: 12px;
      color: var(--text-muted);
      background: transparent;
      border: none;
      text-align: left;
      padding: 4px 6px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .filter-item.active,
    .filter-item:hover {
      color: var(--text);
      background: rgba(74, 158, 255, 0.08);
    }

    .node-browser {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .node-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .node-search input {
      width: 100%;
      min-width: 320px;
      padding: 12px 16px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: rgba(20, 20, 20, 0.6);
      color: var(--text);
      font-size: 13px;
      outline: none;
    }

    .node-search input::placeholder {
      color: var(--text-subtle);
    }
    
    /* Light theme - чистые input-поля */
    body.theme-light .node-search input {
      background: #FFFFFF;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    
    body.theme-light .node-search input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.08);
    }
    
    body.theme-light .node-search input::placeholder {
      color: #9CA3AF;
    }

    .view-toggle {
      display: flex;
      gap: 8px;
    }

    .toggle-btn {
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .toggle-btn.active,
    .toggle-btn:hover {
      color: var(--text);
      border-color: var(--accent-soft);
      background: rgba(74, 158, 255, 0.1);
    }

    .node-results.grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }

    .node-results.list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .node-path-card {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .node-path-card .path-preview {
      min-height: 90px;
      border-radius: 8px;
    }

    .node-path-card .path-title {
      font-size: 15px;
    }

    .path-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.6;
      min-height: 18px;
    }

    .path-details {
      font-size: 11px;
      color: var(--text-subtle);
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .path-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tag-chip {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 4px 8px;
      border-radius: 999px;
      border: 1px solid var(--border-subtle);
      color: var(--tag-text, var(--text-muted));
      background: var(--tag-bg, rgba(74, 158, 255, 0.12));
      border-color: var(--tag-border, rgba(74, 158, 255, 0.35));
    }

    .empty-state {
      color: var(--text-subtle);
      font-size: 14px;
      text-align: center;
      padding: 60px 24px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      width: 100%;
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      padding: 24px;
    }

    .achievement-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .achievement-card::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, 
        var(--difficulty-color-start, #000) 0%, 
        var(--difficulty-color-mid, #000) 50%, 
        var(--difficulty-color-end, #000) 100%
      );
      opacity: 0.9;
      filter: url(#noise);
      box-shadow: 0 0 15px var(--difficulty-color-mid, #000);
    }

    .achievement-card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30px;
      background: linear-gradient(to top, 
        var(--difficulty-color-glow, rgba(0,0,0,0.3)) 0%, 
        transparent 100%
      );
      opacity: 0.6;
      pointer-events: none;
    }

    /* Difficulty color mappings */
    .achievement-card[data-difficulty="0"] {
      --difficulty-color-start: #000;
      --difficulty-color-mid: #000;
      --difficulty-color-end: #000;
      --difficulty-color-glow: rgba(0, 0, 0, 0.3);
    }

    .achievement-card[data-difficulty="1"] {
      --difficulty-color-start: #00ff00;
      --difficulty-color-mid: #00ff00;
      --difficulty-color-end: #00ff00;
      --difficulty-color-glow: rgba(0, 255, 0, 0.3);
    }

    .achievement-card[data-difficulty="2"] {
      --difficulty-color-start: #00ff00;
      --difficulty-color-mid: #00ff00;
      --difficulty-color-end: #40ff00;
      --difficulty-color-glow: rgba(0, 255, 0, 0.3);
    }

    .achievement-card[data-difficulty="3"] {
      --difficulty-color-start: #40ff00;
      --difficulty-color-mid: #80ff00;
      --difficulty-color-end: #a0ff00;
      --difficulty-color-glow: rgba(128, 255, 0, 0.3);
    }

    .achievement-card[data-difficulty="4"] {
      --difficulty-color-start: #a0ff00;
      --difficulty-color-mid: #c0ff00;
      --difficulty-color-end: #e0ff00;
      --difficulty-color-glow: rgba(192, 255, 0, 0.3);
    }

    .achievement-card[data-difficulty="5"] {
      --difficulty-color-start: #e0ff00;
      --difficulty-color-mid: #ffaa00;
      --difficulty-color-end: #ff8800;
      --difficulty-color-glow: rgba(255, 170, 0, 0.3);
    }

    .achievement-card[data-difficulty="6"] {
      --difficulty-color-start: #ff8800;
      --difficulty-color-mid: #ff6600;
      --difficulty-color-end: #ff4400;
      --difficulty-color-glow: rgba(255, 102, 0, 0.3);
    }

    .achievement-card[data-difficulty="7"] {
      --difficulty-color-start: #ff4400;
      --difficulty-color-mid: #ff2200;
      --difficulty-color-end: #ff0000;
      --difficulty-color-glow: rgba(255, 34, 0, 0.3);
    }

    .achievement-card[data-difficulty="8"] {
      --difficulty-color-start: #ff0000;
      --difficulty-color-mid: #ff0000;
      --difficulty-color-end: #dd0000;
      --difficulty-color-glow: rgba(255, 0, 0, 0.3);
    }

    .achievement-card[data-difficulty="9"] {
      --difficulty-color-start: #dd0000;
      --difficulty-color-mid: #bb00bb;
      --difficulty-color-end: #8800ff;
      --difficulty-color-glow: rgba(187, 0, 187, 0.3);
    }

    .achievement-card[data-difficulty="10"] {
      --difficulty-color-start: #8800ff;
      --difficulty-color-mid: #6600cc;
      --difficulty-color-end: #4400aa;
      --difficulty-color-glow: rgba(102, 0, 204, 0.3);
    }

    .achievement-card:hover {
      background: var(--card-hover);
      transform: translateY(-2px);
    }
    
    /* Light theme - мягкая глубина для достижений */
    body.theme-light .achievement-card {
      border: 1px solid rgba(0, 0, 0, 0.05);
      background: #FFFFFF;
    }
    
    body.theme-light .achievement-card:hover {
      background: #FEFEFE;
      border-color: rgba(74, 158, 255, 0.15);
    }
    
    /* Filters и button controls для светлой темы */
    body.theme-light .filter-item {
      border: 1px solid rgba(0, 0, 0, 0.06);
      background: #FFFFFF;
    }
    
    body.theme-light .filter-item:hover {
      border-color: rgba(74, 158, 255, 0.2);
      background: #F9FAFB;
    }

    body.theme-light .filter-item.active {
      background: rgba(74, 158, 255, 0.08);
      border-color: var(--accent);
      color: var(--accent);
    }
    
    /* Dropdowns для светлой темы */
    body.theme-light select {
      background: #FFFFFF;
      border: 1px solid rgba(0, 0, 0, 0.08);
      color: #111827;
    }
    
    body.theme-light select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.08);
    }
    
    /* Toggle switches для светлой темы */
    body.theme-light .toggle-switch {
      background: #E5E7EB;
    }
    
    body.theme-light .toggle-switch.active {
      background: var(--accent);
    }
    
    body.theme-light .toggle-switch:hover:not(.active) {
      background: #D1D5DB;
    }
    
    /* Badge для светлой темы */
    body.theme-light .settings-badge {
      background: rgba(74, 158, 255, 0.1);
      color: var(--accent);
    }
    
    body.theme-light .badge-success {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }
    
    body.theme-light .badge-warning {
      background: rgba(245, 158, 11, 0.1);
      color: #D97706;
    }

    .achievement-card:hover .achievement-icon-actions {
      opacity: 1;
      pointer-events: auto;
    }

    .achievement-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .achievement-icon {
      font-size: 32px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      border-radius: 8px;
    }

    .achievement-info {
      flex: 1;
    }

    .achievement-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .achievement-difficulty {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .achievement-description {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.5;
      max-height: 60px;
      overflow: hidden;
      position: relative;
    }

    .achievement-source {
      font-size: 12px;
      color: var(--text-subtle);
      padding-top: 8px;
      border-top: 1px solid var(--border-subtle);
      position: relative;
      z-index: 2;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    }

    .achievement-unlocked-badge {
      display: inline-block;
      padding: 4px 8px;
      background: rgba(82, 196, 26, 0.1);
      color: var(--status-green);
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .achievements-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px 16px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }

    .achievements-tabs {
      display: flex;
      gap: 8px;
    }

    .achievements-view-toggle {
      display: flex;
      gap: 4px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 2px;
    }

    .view-toggle-btn {
      width: 36px;
      height: 36px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 4px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .view-toggle-btn:hover {
      background: var(--card-hover);
    }

    .view-toggle-btn.active {
      background: var(--accent);
    }

    .achievements-tab {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .achievements-tab:hover {
      background: var(--card-hover);
      color: var(--text);
    }

    .achievements-tab.active {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }

    .achievement-icon-actions {
      position: absolute;
      bottom: 12px;
      right: 12px;
      display: flex;
      gap: 6px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 10;
    }

    .achievement-card:hover .achievement-icon-actions {
      opacity: 1;
      pointer-events: auto;
    }

    .achievement-icon-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .achievement-icon-btn:hover {
      background: rgba(0, 0, 0, 0.7);
      border-color: rgba(255, 255, 255, 0.4);
      transform: scale(1.15);
    }

    .achievement-icon-btn.danger {
      color: #ff6b6b;
    }

    .achievement-icon-btn.danger:hover {
      background: rgba(255, 107, 107, 0.15);
      border-color: rgba(255, 107, 107, 0.4);
      color: #ff8585;
    }

    .path-category {
      margin-bottom: 32px;
    }

    .path-category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 16px;
    }

    .path-category-header:hover {
      background: var(--card-hover);
      transform: translateX(4px);
    }

    .path-category-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent);
      border-radius: 8px;
    }

    .path-category-info {
      flex: 1;
    }

    .path-category-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .path-category-count {
      font-size: 13px;
      color: var(--text-muted);
    }

    .path-category-arrow {
      font-size: 20px;
      color: var(--text-muted);
      transition: transform 0.2s ease;
    }

    .path-category.expanded .path-category-arrow {
      transform: rotate(90deg);
    }

    .path-category-achievements {
      display: none;
      padding-left: 20px;
    }

    .path-category.expanded .path-category-achievements {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .tag-category {
      margin-bottom: 32px;
    }

    .tag-category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 16px;
    }

    .tag-category-header:hover {
      background: var(--card-hover);
      transform: translateX(4px);
    }

    .tag-category-icon {
      font-size: 18px;
      font-weight: 600;
      padding: 8px 16px;
      background: rgba(74, 158, 255, 0.1);
      border-radius: 6px;
    }

    .tag-category-info {
      flex: 1;
    }

    .tag-category-count {
      font-size: 13px;
      color: var(--text-muted);
    }

    .tag-category-arrow {
      font-size: 20px;
      color: var(--text-muted);
      transition: transform 0.2s ease;
    }

    .tag-category.expanded .tag-category-arrow {
      transform: rotate(90deg);
    }

    .tag-category-achievements {
      display: none;
      padding-left: 20px;
    }

    .tag-category.expanded .tag-category-achievements {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .tag-group-paths {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: -1;
      animation: fadeIn 0.2s ease;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.2s ease, visibility 0.2s ease, z-index 0s 0.2s;
    }

    .modal-backdrop.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      z-index: 100;
      transition: opacity 0.2s ease, visibility 0.2s ease, z-index 0s 0s;
    }

    .modal {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px;
      width: 100%;
      max-width: 440px;
      color: var(--text);
    }

    .modal h3 {
      margin-bottom: 28px;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.3px;
    }

    .modal input,
    .modal textarea {
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius);
      padding: 11px 14px;
      color: var(--text);
      margin-bottom: 14px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      transition: all 0.15s ease;
    }

    .preview-row {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 14px;
    }

    .preview-row input {
      margin-bottom: 0;
    }

    .preview-btn {
      border: 1px solid var(--border-subtle);
      background: var(--card-bg);
      color: var(--text);
      border-radius: 8px;
      padding: 10px 12px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 14px;
    }

    .preview-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .preview-thumb {
      width: 100%;
      height: 120px;
      border-radius: 10px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-subtle);
      font-size: 22px;
      margin-bottom: 14px;
    }

    .preview-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transform-origin: 50% 50%;
    }

    .preview-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 6px;
    }
    
    .modal input:focus,
    .modal textarea:focus {
      outline: none;
      border-color: var(--accent);
      background: var(--panel);
    }
    
    /* Modal inputs и textarea для светлой темы */
    body.theme-light .modal input,
    body.theme-light .modal textarea {
      background: #FFFFFF;
      border: 1px solid rgba(0, 0, 0, 0.08);
      color: #111827;
    }
    
    body.theme-light .modal input:focus,
    body.theme-light .modal textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.08);
      background: #FAFBFC;
    }
    
    body.theme-light .modal input::placeholder,
    body.theme-light .modal textarea::placeholder {
      color: #9CA3AF;
    }

    .modal textarea {
      min-height: 80px;
      resize: vertical;
      line-height: 1.5;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    .system-status {
      margin-top: 64px;
      padding: 20px 24px;
      background: var(--panel);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }
    
    .status-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .status-label {
      font-size: 11px;
      color: var(--text-subtle);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    
    .status-value {
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--status-green);
      box-shadow: 0 0 8px currentColor;
    }
    
    .status-indicator.warning {
      background: var(--status-yellow);
    }
    
    .status-indicator.inactive {
      background: var(--status-gray);
      box-shadow: none;
    }
    
    .empty-paths-card {
      background: var(--card-bg);
      border: 1px dashed var(--border);
      border-radius: var(--radius);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 12px;
      color: var(--text-subtle);
      font-size: 13px;
      padding: 24px;
      text-align: center;
    }
    
    .empty-paths-card svg {
      width: 32px;
      height: 32px;
      opacity: 0.3;
      stroke: var(--text-muted);
      stroke-width: 1.5;
    }

    /* ===== SETTINGS STYLES ===== */
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .settings-section {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 24px;
      animation: fadeIn 0.3s ease;
    }

    .settings-section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }

    .settings-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      transition: all 0.2s ease;
      cursor: pointer;
      gap: 16px;
    }

    .setting-item:hover {
      background: rgba(0, 0, 0, 0.5);
      border-color: var(--border);
    }

    .setting-label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .setting-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text);
    }

    .setting-description {
      font-size: 12px;
      color: var(--text-muted);
    }

    .setting-select {
      padding: 8px 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .setting-select:hover {
      border-color: var(--accent-soft);
    }

    .setting-select:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-flex;
      width: 48px;
      height: 24px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toggle-switch.active {
      background: var(--accent);
      border-color: var(--accent);
    }

    .toggle-input {
      display: none;
    }

    .toggle-slider {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: var(--text-muted);
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toggle-input:checked + .toggle-slider {
      background: white;
      transform: translateX(24px);
    }

    .toggle-switch:hover {
      border-color: var(--accent-soft);
    }

    /* Module List */
    .module-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .module-badge {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(74, 158, 255, 0.1);
      border: 1px solid var(--accent-soft);
      border-radius: 999px;
      font-size: 12px;
      color: var(--accent);
      font-weight: 500;
    }

    .module-badge.disabled {
      opacity: 0.5;
      border-color: var(--border);
      background: rgba(0, 0, 0, 0.2);
      color: var(--text-muted);
    }

    /* Settings Status Message */
    .settings-status {
      border-radius: 8px;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { 
        opacity: 0; 
        transform: translateY(-12px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }

    /* Buttons */
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-block;
    }

    .btn:hover {
      background: var(--panel);
      border-color: var(--border);
      transform: translateY(-1px);
    }

    .btn.primary {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }

    .btn.primary:hover {
      background: var(--accent-soft);
      border-color: var(--accent-soft);
    }

    @media (max-width: 960px) {
      .app {
        grid-template-columns: 1fr;
      }

      .sidebar {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        padding: 8px;
        border-right: none;
        border-bottom: 1px solid var(--border);
      }
      
      .sidebar-header {
        display: none;
      }

      .content {
        padding: 32px 24px;
      }
      
      .content-grid {
        gap: 20px;
      }

      .setting-item {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>
  <!-- SVG filter for noise effect -->
  <svg class="noise-filter">
    <defs>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="1" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="0 0 0 0 0 1"/>
        </feComponentTransfer>
        <feBlend mode="overlay" in="SourceGraphic"/>
      </filter>
    </defs>
  </svg>

  <div class="loading-overlay" id="loading-overlay">
    <div class="loading-spinner"></div>
    <div class="loading-text">Loading module</div>
  </div>

  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-header"><img src="data:image/svg+xml,%3Csvg width='6528' height='2990' viewBox='0 0 6528 2990' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5280.91 780.463C5191.43 781.559 5186.76 782.104 5153.58 795.381C5103.29 815.507 5066.17 848.104 5039.07 895.927C5022.86 924.543 5013.08 954.871 5009.68 987.067C5008.47 998.499 5008.04 1152.59 5008.37 1457.51L5008.86 1910.96L5015.36 1885.2C5026.66 1840.44 5044.71 1807.58 5074.4 1777.77C5101.9 1750.16 5120.18 1737.82 5149.64 1726.97C5181.6 1715.19 5189.22 1714.36 5271.51 1713.58L5345.89 1712.89L5349.43 1695.32C5352.65 1679.33 5359.8 1647.75 5384.51 1540.43C5397.83 1482.53 5411.84 1417.79 5413.1 1408.28L5414.24 1399.64L5216.06 1400.18C5090.28 1400.52 5017.28 1400.11 5016.22 1399.05C5014.52 1397.35 5047.68 1360.26 5061.4 1348.52C5065.18 1345.29 5092.22 1319.32 5121.48 1290.82C5215.09 1199.64 5219.51 1196.17 5259.97 1182.13C5295.01 1169.96 5306.83 1168.67 5393.95 1167.49L5471.59 1166.44L5475.72 1149.17C5478 1139.67 5484.03 1114.79 5489.14 1093.89C5494.25 1072.99 5501.99 1039.56 5506.36 1019.61C5510.72 999.661 5520.38 957.685 5527.82 926.333C5550.09 832.484 5560.72 785.556 5560.72 781.104C5560.72 778.89 5433.51 778.598 5280.91 780.463ZM5933.41 779.935L5793.96 780.387L5793.1 784.264C5789.46 800.703 5773.27 870.187 5764.83 905.604C5755.54 944.566 5744.24 994.517 5735.11 1036.89C5728.29 1068.51 5714.19 1130.71 5709.9 1148C5707.47 1157.81 5705.78 1166.13 5706.15 1166.49C5706.51 1166.85 5774.79 1167.26 5857.88 1167.39L6008.95 1167.64L6010.21 1162.72C6010.9 1160.02 6015.35 1139.93 6020.08 1118.08C6030.47 1070.11 6038.11 1036.44 6042.59 1018.86C6046.36 1004.1 6060.79 939.534 6064.44 921.151C6067.7 904.744 6076.6 865.502 6080.9 848.599C6082.84 840.999 6086.91 822.626 6089.95 807.772L6095.47 780.766L6086.75 779.717C6081.96 779.14 6076.87 778.852 6075.45 779.076C6074.02 779.299 6010.1 779.686 5933.41 779.935ZM6327.02 792.89C6325.45 798.829 6322.6 810.683 6320.67 819.233C6318.75 827.784 6314.86 844.108 6312.01 855.509C6309.16 866.91 6301.01 903.056 6293.88 935.833C6279.96 999.86 6276.03 1017.25 6256.2 1102.53C6249.13 1132.93 6242.86 1160.14 6242.26 1162.99L6241.18 1168.17L6384.15 1167.72L6527.12 1167.27L6527.08 1072.71C6527.03 981.511 6526.89 977.604 6523.26 962.608C6509.58 906.191 6482.38 863.562 6438.17 829.237C6413.09 809.765 6386.95 796.601 6355.07 787.39C6329.78 780.085 6330.43 779.959 6327.02 792.89ZM6522.43 1210.67C6519.24 1232.59 6510.52 1261.17 6501.33 1279.83C6482.66 1317.73 6441.41 1358.06 6401.09 1377.83C6361.97 1397.01 6350.88 1398.74 6259.06 1400.01L6186.18 1401.01L6182.54 1416.74C6180.53 1425.39 6175.47 1448.79 6171.3 1468.74C6161.4 1516.1 6146.66 1581.15 6125.47 1670.85C6121.43 1687.95 6118.04 1704.24 6117.94 1707.05L6117.76 1712.16L6309.49 1712.04C6414.94 1711.98 6506.02 1711.36 6511.89 1710.66C6522.47 1709.41 6522.55 1709.43 6521.52 1713.44C6520.46 1717.55 6342.93 1894.87 6325.56 1909.17C6314.09 1918.61 6292.45 1929 6271.48 1935.13C6244.45 1943.03 6225.75 1944.55 6152.31 1944.82C6115.26 1944.96 6079.58 1945.56 6073.02 1946.15L6061.09 1947.23L6054.49 1976.6C6050.86 1992.75 6045.17 2017.24 6041.84 2031.01C6036.01 2055.13 6019.58 2127.42 6008.09 2179.57C6005.05 2193.34 5996.32 2230.66 5988.69 2262.48C5981.05 2294.31 5974.45 2323.18 5974.01 2326.63L5973.21 2332.92L6009.18 2334.2C6028.96 2334.91 6106.96 2335.05 6182.5 2334.51C6310.39 2333.61 6320.99 2333.3 6336.39 2330.12C6441.02 2308.51 6515.06 2226.58 6526.33 2119.97C6528.4 2100.37 6528.63 1220.9 6526.57 1201.85L6525.35 1190.63L6522.43 1210.67ZM5762.38 1400.07C5698.97 1400.33 5647.09 1400.91 5647.09 1401.36C5647.09 1401.82 5643.55 1419.5 5639.22 1440.65C5634.89 1461.8 5629.84 1486.74 5627.98 1496.08C5622.96 1521.33 5613.05 1565.84 5606.57 1592.25C5603.42 1605.08 5598.73 1624.9 5596.14 1636.3C5593.55 1647.7 5588.53 1669.29 5584.97 1684.29C5581.23 1700.02 5579.17 1711.97 5580.11 1712.54C5582.43 1713.98 5882.64 1711.53 5883.83 1710.07C5884.38 1709.4 5888.09 1693.69 5892.08 1675.16C5896.07 1656.64 5903.94 1620.1 5909.56 1593.98C5915.19 1567.85 5923.38 1531.7 5927.76 1513.65C5939.87 1463.82 5947.54 1430.13 5949.38 1418.64C5950.3 1412.94 5951.53 1406.14 5952.13 1403.53L5953.21 1398.78L5915.44 1399.2C5894.67 1399.43 5825.79 1399.82 5762.38 1400.07ZM5008.03 2030.58C5008.07 2121.29 5008.99 2135.73 5016.59 2164.44C5026.35 2201.3 5043.62 2230.34 5074.44 2261.7C5097.73 2285.41 5129.12 2306.31 5157.47 2316.98C5175.2 2323.66 5200.24 2330.03 5201.96 2328.31C5203.93 2326.34 5211.4 2296.63 5224.82 2237.44C5230.85 2210.83 5240.9 2166.92 5247.16 2139.84C5264.37 2065.39 5291.27 1946.71 5291.27 1945.24C5291.27 1944.91 5227.53 1944.64 5149.64 1944.64H5008L5008.03 2030.58ZM5534.38 1945.92C5527.97 1946.25 5522.72 1946.77 5522.72 1947.07C5522.72 1949.79 5512.31 1997.3 5503.76 2033.6C5497.94 2058.3 5488.55 2099.11 5482.89 2124.29C5477.23 2149.47 5470.35 2179.78 5467.61 2191.66C5464.87 2203.54 5459 2229.58 5454.56 2249.53C5450.13 2269.48 5444.61 2294.02 5442.29 2304.06C5439.98 2314.11 5438.09 2324.67 5438.09 2327.53V2332.75L5497.96 2333.89C5573.82 2335.34 5715.86 2335.38 5729.5 2333.95L5739.88 2332.87L5743.55 2317.11C5745.57 2308.44 5750.34 2287.75 5754.16 2271.12C5757.98 2254.49 5762.23 2236.62 5763.62 2231.39C5766.38 2221 5777.67 2172.19 5788.59 2123.43C5792.42 2106.33 5800.67 2070.57 5806.92 2043.97C5816.97 2001.21 5828.28 1949.58 5828.4 1945.94C5828.45 1944.69 5558.35 1944.68 5534.38 1945.92Z' fill='white'/%3E%3Cpath d='M90 2200V912H754C859.333 912 946 933.333 1014 976C1083.33 1017.33 1134.67 1074 1168 1146C1201.33 1218 1218 1298 1218 1386C1218 1476.67 1198.67 1557.33 1160 1628C1121.33 1698.67 1066.67 1754 996 1794C925.333 1834 842 1854 746 1854H466V2200H90ZM466 1566H660C718.667 1566 762 1549.33 790 1516C819.333 1482.67 834 1439.33 834 1386C834 1328.67 820.667 1283.33 794 1250C767.333 1216.67 726 1200 670 1200H466V1566ZM1118.36 2200L1612.36 912H2010.36L2504.36 2200H2112.36L2004.36 1926H1616.36L1510.36 2200H1118.36ZM1666.36 1656H1954.36L1810.36 1278L1666.36 1656ZM2756.77 2200V1192H2394.77V912H3494.77V1192H3132.77V2200H2756.77ZM3593.91 2200V912H3969.91V1392H4413.91V912H4789.91V2200H4413.91V1720H3969.91V2200H3593.91Z' fill='white'/%3E%3C/svg%3E" alt="PATH#" style="width: 100%; height: auto;"/></div>
      <div class="nav-item active" data-nav="home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </div>
      <div class="nav-item" data-nav="node">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5C12 18.5 12 16.5 12 15M12 9C12 7 12 5 12 3.5M15 12C16.5 12 18.5 12 20.5 12M9 12C7 12 5 12 3.5 12M12 12L12 12C10.5 12 9.5 11 9.5 9.5C9.5 8 10.5 7 12 7C13.5 7 14.5 8 14.5 9.5C14.5 11 13.5 12 12 12ZM12 12L12 12C12 13.5 11 14.5 9.5 14.5C8 14.5 7 13.5 7 12C7 10.5 8 9.5 9.5 9.5C11 9.5 12 10.5 12 12Z" transform="rotate(45 12 12)"/></svg>
        <span>My Paths</span>
      </div>
      <div class="nav-item" data-nav="marketplace">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        <span>Marketplace</span>
      </div>
      <div class="nav-item" data-nav="notes">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/><path d="M15 3v6h6"/></svg>
        <span>Notes</span>
      </div>
      <div class="nav-item" data-nav="achievements">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
        <span>Achievements</span>
      </div>
      <div class="nav-item" data-nav="settings">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span>Settings</span>
      </div>
    </aside>

    <main class="main">
      <div class="topbar">
        <div class="topbar-inner">
          <div class="topbar-title" id="topbar-title">Home</div>
          <div class="topbar-subtitle" id="topbar-subtitle"></div>
        </div>
      </div>
      <div class="content">
        <section id="view-home" class="view active">
          <!-- Hero Block -->
          <div class="hero-block">
            <div style="text-align: center; margin-bottom: 20px;"><img src="data:image/svg+xml,%3Csvg width='6528' height='2990' viewBox='0 0 6528 2990' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5280.91 780.463C5191.43 781.559 5186.76 782.104 5153.58 795.381C5103.29 815.507 5066.17 848.104 5039.07 895.927C5022.86 924.543 5013.08 954.871 5009.68 987.067C5008.47 998.499 5008.04 1152.59 5008.37 1457.51L5008.86 1910.96L5015.36 1885.2C5026.66 1840.44 5044.71 1807.58 5074.4 1777.77C5101.9 1750.16 5120.18 1737.82 5149.64 1726.97C5181.6 1715.19 5189.22 1714.36 5271.51 1713.58L5345.89 1712.89L5349.43 1695.32C5352.65 1679.33 5359.8 1647.75 5384.51 1540.43C5397.83 1482.53 5411.84 1417.79 5413.1 1408.28L5414.24 1399.64L5216.06 1400.18C5090.28 1400.52 5017.28 1400.11 5016.22 1399.05C5014.52 1397.35 5047.68 1360.26 5061.4 1348.52C5065.18 1345.29 5092.22 1319.32 5121.48 1290.82C5215.09 1199.64 5219.51 1196.17 5259.97 1182.13C5295.01 1169.96 5306.83 1168.67 5393.95 1167.49L5471.59 1166.44L5475.72 1149.17C5478 1139.67 5484.03 1114.79 5489.14 1093.89C5494.25 1072.99 5501.99 1039.56 5506.36 1019.61C5510.72 999.661 5520.38 957.685 5527.82 926.333C5550.09 832.484 5560.72 785.556 5560.72 781.104C5560.72 778.89 5433.51 778.598 5280.91 780.463ZM5933.41 779.935L5793.96 780.387L5793.1 784.264C5789.46 800.703 5773.27 870.187 5764.83 905.604C5755.54 944.566 5744.24 994.517 5735.11 1036.89C5728.29 1068.51 5714.19 1130.71 5709.9 1148C5707.47 1157.81 5705.78 1166.13 5706.15 1166.49C5706.51 1166.85 5774.79 1167.26 5857.88 1167.39L6008.95 1167.64L6010.21 1162.72C6010.9 1160.02 6015.35 1139.93 6020.08 1118.08C6030.47 1070.11 6038.11 1036.44 6042.59 1018.86C6046.36 1004.1 6060.79 939.534 6064.44 921.151C6067.7 904.744 6076.6 865.502 6080.9 848.599C6082.84 840.999 6086.91 822.626 6089.95 807.772L6095.47 780.766L6086.75 779.717C6081.96 779.14 6076.87 778.852 6075.45 779.076C6074.02 779.299 6010.1 779.686 5933.41 779.935ZM6327.02 792.89C6325.45 798.829 6322.6 810.683 6320.67 819.233C6318.75 827.784 6314.86 844.108 6312.01 855.509C6309.16 866.91 6301.01 903.056 6293.88 935.833C6279.96 999.86 6276.03 1017.25 6256.2 1102.53C6249.13 1132.93 6242.86 1160.14 6242.26 1162.99L6241.18 1168.17L6384.15 1167.72L6527.12 1167.27L6527.08 1072.71C6527.03 981.511 6526.89 977.604 6523.26 962.608C6509.58 906.191 6482.38 863.562 6438.17 829.237C6413.09 809.765 6386.95 796.601 6355.07 787.39C6329.78 780.085 6330.43 779.959 6327.02 792.89ZM6522.43 1210.67C6519.24 1232.59 6510.52 1261.17 6501.33 1279.83C6482.66 1317.73 6441.41 1358.06 6401.09 1377.83C6361.97 1397.01 6350.88 1398.74 6259.06 1400.01L6186.18 1401.01L6182.54 1416.74C6180.53 1425.39 6175.47 1448.79 6171.3 1468.74C6161.4 1516.1 6146.66 1581.15 6125.47 1670.85C6121.43 1687.95 6118.04 1704.24 6117.94 1707.05L6117.76 1712.16L6309.49 1712.04C6414.94 1711.98 6506.02 1711.36 6511.89 1710.66C6522.47 1709.41 6522.55 1709.43 6521.52 1713.44C6520.46 1717.55 6342.93 1894.87 6325.56 1909.17C6314.09 1918.61 6292.45 1929 6271.48 1935.13C6244.45 1943.03 6225.75 1944.55 6152.31 1944.82C6115.26 1944.96 6079.58 1945.56 6073.02 1946.15L6061.09 1947.23L6054.49 1976.6C6050.86 1992.75 6045.17 2017.24 6041.84 2031.01C6036.01 2055.13 6019.58 2127.42 6008.09 2179.57C6005.05 2193.34 5996.32 2230.66 5988.69 2262.48C5981.05 2294.31 5974.45 2323.18 5974.01 2326.63L5973.21 2332.92L6009.18 2334.2C6028.96 2334.91 6106.96 2335.05 6182.5 2334.51C6310.39 2333.61 6320.99 2333.3 6336.39 2330.12C6441.02 2308.51 6515.06 2226.58 6526.33 2119.97C6528.4 2100.37 6528.63 1220.9 6526.57 1201.85L6525.35 1190.63L6522.43 1210.67ZM5762.38 1400.07C5698.97 1400.33 5647.09 1400.91 5647.09 1401.36C5647.09 1401.82 5643.55 1419.5 5639.22 1440.65C5634.89 1461.8 5629.84 1486.74 5627.98 1496.08C5622.96 1521.33 5613.05 1565.84 5606.57 1592.25C5603.42 1605.08 5598.73 1624.9 5596.14 1636.3C5593.55 1647.7 5588.53 1669.29 5584.97 1684.29C5581.23 1700.02 5579.17 1711.97 5580.11 1712.54C5582.43 1713.98 5882.64 1711.53 5883.83 1710.07C5884.38 1709.4 5888.09 1693.69 5892.08 1675.16C5896.07 1656.64 5903.94 1620.1 5909.56 1593.98C5915.19 1567.85 5923.38 1531.7 5927.76 1513.65C5939.87 1463.82 5947.54 1430.13 5949.38 1418.64C5950.3 1412.94 5951.53 1406.14 5952.13 1403.53L5953.21 1398.78L5915.44 1399.2C5894.67 1399.43 5825.79 1399.82 5762.38 1400.07ZM5008.03 2030.58C5008.07 2121.29 5008.99 2135.73 5016.59 2164.44C5026.35 2201.3 5043.62 2230.34 5074.44 2261.7C5097.73 2285.41 5129.12 2306.31 5157.47 2316.98C5175.2 2323.66 5200.24 2330.03 5201.96 2328.31C5203.93 2326.34 5211.4 2296.63 5224.82 2237.44C5230.85 2210.83 5240.9 2166.92 5247.16 2139.84C5264.37 2065.39 5291.27 1946.71 5291.27 1945.24C5291.27 1944.91 5227.53 1944.64 5149.64 1944.64H5008L5008.03 2030.58ZM5534.38 1945.92C5527.97 1946.25 5522.72 1946.77 5522.72 1947.07C5522.72 1949.79 5512.31 1997.3 5503.76 2033.6C5497.94 2058.3 5488.55 2099.11 5482.89 2124.29C5477.23 2149.47 5470.35 2179.78 5467.61 2191.66C5464.87 2203.54 5459 2229.58 5454.56 2249.53C5450.13 2269.48 5444.61 2294.02 5442.29 2304.06C5439.98 2314.11 5438.09 2324.67 5438.09 2327.53V2332.75L5497.96 2333.89C5573.82 2335.34 5715.86 2335.38 5729.5 2333.95L5739.88 2332.87L5743.55 2317.11C5745.57 2308.44 5750.34 2287.75 5754.16 2271.12C5757.98 2254.49 5762.23 2236.62 5763.62 2231.39C5766.38 2221 5777.67 2172.19 5788.59 2123.43C5792.42 2106.33 5800.67 2070.57 5806.92 2043.97C5816.97 2001.21 5828.28 1949.58 5828.4 1945.94C5828.45 1944.69 5558.35 1944.68 5534.38 1945.92Z' fill='white'/%3E%3Cpath d='M90 2200V912H754C859.333 912 946 933.333 1014 976C1083.33 1017.33 1134.67 1074 1168 1146C1201.33 1218 1218 1298 1218 1386C1218 1476.67 1198.67 1557.33 1160 1628C1121.33 1698.67 1066.67 1754 996 1794C925.333 1834 842 1854 746 1854H466V2200H90ZM466 1566H660C718.667 1566 762 1549.33 790 1516C819.333 1482.67 834 1439.33 834 1386C834 1328.67 820.667 1283.33 794 1250C767.333 1216.67 726 1200 670 1200H466V1566ZM1118.36 2200L1612.36 912H2010.36L2504.36 2200H2112.36L2004.36 1926H1616.36L1510.36 2200H1118.36ZM1666.36 1656H1954.36L1810.36 1278L1666.36 1656ZM2756.77 2200V1192H2394.77V912H3494.77V1192H3132.77V2200H2756.77ZM3593.91 2200V912H3969.91V1392H4413.91V912H4789.91V2200H4413.91V1720H3969.91V2200H3593.91Z' fill='white'/%3E%3C/svg%3E" alt="PATH#" style="width: 300px; height: auto;"/></div>
            <h1 class="hero-title">Welcome</h1>
            <p class="hero-subtitle">Build logic from nodes. Create paths that are independent, versioned and engine-agnostic.</p>
          </div>

          <!-- Recent Paths Block -->
          <div class="section-title">Your Paths</div>
          <div class="content-grid" id="recent-grid">
            ${pathCards}
          </div>

          <!-- System Status Block -->
          <div class="system-status">
            <div class="status-item">
              <div class="status-label">Engine</div>
              <div class="status-value">
                <span class="status-indicator"></span>
                Running
              </div>
            </div>
            <div class="status-item">
              <div class="status-label">Modules</div>
              <div class="status-value">
                <span class="status-indicator"></span>
                4 loaded
              </div>
            </div>
            <div class="status-item">
              <div class="status-label">UI Extensions</div>
              <div class="status-value">
                <span class="status-indicator"></span>
                7 available
              </div>
            </div>
            <div class="status-item">
              <div class="status-label">System</div>
              <div class="status-value">
                <span class="status-indicator"></span>
                No errors
              </div>
            </div>
          </div>
        </section>

        <section id="view-node" class="view">
          <div class="node-view-header">
            <div>
              <div class="node-title">MY PATHS</div>
              <div class="node-subtitle">All paths in your system</div>
            </div>
          </div>
          <div class="node-layout">
            <aside class="node-filters">
              <div class="filter-group">
                <div class="filter-title">Categories</div>
                <div class="filter-list" id="filter-categories"></div>
              </div>
              <div class="filter-group">
                <div class="filter-title">Tags</div>
                <div class="filter-list" id="filter-tags"></div>
              </div>
              <div class="filter-group">
                <div class="filter-title">Status</div>
                <div class="filter-list" id="filter-status"></div>
              </div>
            </aside>
            <section class="node-browser">
              <div class="node-toolbar">
                <div class="node-search">
                  <input id="node-search" placeholder="Search paths, tags, nodes…" />
                </div>
                <div class="view-toggle">
                  <button class="toggle-btn active" data-view="grid">Grid</button>
                  <button class="toggle-btn" data-view="list">List</button>
                </div>
              </div>
              <div id="node-results" class="node-results grid"></div>
              <div id="node-empty" class="empty-state" style="display: none;"></div>
            </section>
          </div>
        </section>

        <section id="view-marketplace" class="view">
          <div class="empty-state">Marketplace coming soon.</div>
        </section>

        <section id="view-notes" class="view">
          <div class="empty-state">Notes coming soon.</div>
        </section>

        <section id="view-achievements" class="view">
          <div class="achievements-header-row">
            <div class="achievements-tabs">
              <button class="achievements-tab active" data-tab="active">Active</button>
              <button class="achievements-tab" data-tab="archive">Archive</button>
            </div>
            <div class="achievements-view-toggle">
              <button class="view-toggle-btn active" data-view="all" title="Show all achievements">📋</button>
              <button class="view-toggle-btn" data-view="categories" title="Group by paths">📁</button>
            </div>
          </div>
          <div class="achievements-grid" id="achievements-grid"></div>
          <div class="achievements-grid" id="achievements-archive" style="display: none;"></div>
        </section>

        <section id="view-settings" class="view">
          <div class="settings-container">
            <!-- GENERAL SETTINGS -->
            <div class="settings-section">
              <h3 class="settings-section-title">General</h3>
              <div class="settings-group">
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Theme</span>
                    <span class="setting-description">Choose light or dark mode</span>
                  </div>
                  <select class="setting-select" id="setting-theme">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </label>
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Language</span>
                    <span class="setting-description">Select your preferred language</span>
                  </div>
                  <select class="setting-select" id="setting-language">
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </label>
              </div>
              <button class="btn" id="reset-settings-btn" style="margin-top: 12px; background: #f56565; color: white;">Reset All Settings</button>
            </div>

            <!-- NODES & HUB SETTINGS -->
            <div class="settings-section">
              <h3 class="settings-section-title">Nodes & Hub</h3>
              <div class="settings-group">
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Grid Display</span>
                    <span class="setting-description">Show paths in grid layout</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-grid-display" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Highlight Active Nodes</span>
                    <span class="setting-description">Emphasize currently selected node</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-highlight-active" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Autosave Nodes</span>
                    <span class="setting-description">Automatically save node changes</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-autosave-nodes" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Quick Chain Mode</span>
                    <span class="setting-description">Fast node chaining with text input</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-quick-chain" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
              </div>
            </div>

            <!-- ACHIEVEMENTS SETTINGS -->
            <div class="settings-section">
              <h3 class="settings-section-title">Achievements</h3>
              <div class="settings-group">
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Show Notifications</span>
                    <span class="setting-description">Display notifications when achievements are earned</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-show-notifications" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Display Difficulty</span>
                    <span class="setting-description">Show difficulty rating for achievements</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-display-difficulty" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
              </div>
            </div>

            <!-- MODULES & PLUGINS SETTINGS -->
            <div class="settings-section">
              <h3 class="settings-section-title">Modules & Plugins</h3>
              <div class="settings-group">
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Active Modules</span>
                    <span class="setting-description">Enabled system modules</span>
                  </div>
                  <div class="module-list" id="active-modules-list"></div>
                </label>
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Active Extensions</span>
                    <span class="setting-description">Enabled UI plugins</span>
                  </div>
                  <div class="module-list" id="active-extensions-list"></div>
                </label>
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Dependency Check</span>
                    <span class="setting-description">Prevent loading with broken dependencies</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-dependency-check" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
              </div>
            </div>

            <!-- SEQUENCE EDITOR SETTINGS -->
            <div class="settings-section">
              <h3 class="settings-section-title">Sequence Editor</h3>
              <div class="settings-group">
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Enable Sequence Editor</span>
                    <span class="setting-description">Show sequence editor in Node workspace</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-sequence-enabled" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Auto Create Nodes</span>
                    <span class="setting-description">Automatically create nodes from text input</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-sequence-auto-create" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Auto Connect Nodes</span>
                    <span class="setting-description">Automatically connect created nodes in sequence</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-sequence-auto-connect" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
              </div>
            </div>

            <!-- DEVELOPER SETTINGS -->
            <div class="settings-section">
              <h3 class="settings-section-title">Developer</h3>
              <div class="settings-group">
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">Engine Logs</span>
                    <span class="setting-description">Enable verbose logging</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-engine-logs" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
                <label class="setting-item">
                  <div class="setting-label">
                    <span class="setting-name">UI Debug Mode</span>
                    <span class="setting-description">Show debug information in UI</span>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" id="setting-ui-debug" class="toggle-input">
                    <span class="toggle-slider"></span>
                  </div>
                </label>
              </div>
              <button class="btn" id="clear-cache-btn" style="margin-top: 12px;">Clear Cache</button>
            </div>

            <!-- STATUS -->
            <div class="settings-status" id="settings-status" style="display: none; margin-top: 20px; padding: 12px 16px; border-radius: 8px; background: rgba(72, 187, 120, 0.1); color: #48bb78; text-align: center;">
              ✓ Settings saved successfully
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>

  <div class="modal-backdrop" id="modal-backdrop">
    <div class="modal">
      <h3>Create new path</h3>
      <input id="path-title" placeholder="Path title" />
      <textarea id="path-description" placeholder="Short description"></textarea>
      <div class="preview-row">
        <input id="path-preview-url" placeholder="Preview image URL" />
        <button class="preview-btn" id="path-preview-file-btn" type="button">📎</button>
        <input id="path-preview-file" type="file" accept="image/*" style="display: none;" />
      </div>
      <div class="preview-actions">
        <button class="preview-btn" id="path-preview-edit" type="button">Edit</button>
        <button class="preview-btn" id="path-preview-clear" type="button">Remove</button>
      </div>
      <div class="preview-thumb" id="path-preview-thumb">
        <svg class="preview-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <path d="M7 14l3-3 4 4 3-3 3 3" />
          <circle cx="9" cy="9" r="1.5" />
        </svg>
      </div>
      <div style="position: relative;">
        <input id="path-tags" placeholder="tag" maxlength="8" style="padding-left: 24px; font-family: 'IBM Plex Sans', monospace; letter-spacing: 0.5px;" />
        <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-family: 'IBM Plex Sans', monospace; pointer-events: none;">#</span>
      </div>
      <div class="modal-actions">
        <button class="btn" id="cancel-create">Cancel</button>
        <button class="btn primary" id="confirm-create">Create</button>
      </div>
    </div>
  </div>

  <div class="modal-backdrop" id="edit-path-modal">
    <div class="modal">
      <h3>Edit path</h3>
      <input id="edit-path-title" placeholder="Path title" />
      <textarea id="edit-path-description" placeholder="Short description"></textarea>
      <div class="preview-row">
        <input id="edit-path-preview-url" placeholder="Preview image URL" />
        <button class="preview-btn" id="edit-path-preview-file-btn" type="button">📎</button>
        <input id="edit-path-preview-file" type="file" accept="image/*" style="display: none;" />
      </div>
      <div class="preview-actions">
        <button class="preview-btn" id="edit-path-preview-edit" type="button">Edit</button>
        <button class="preview-btn" id="edit-path-preview-clear" type="button">Remove</button>
      </div>
      <div class="preview-thumb" id="edit-path-preview-thumb">
        <svg class="preview-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <path d="M7 14l3-3 4 4 3-3 3 3" />
          <circle cx="9" cy="9" r="1.5" />
        </svg>
      </div>
      <div style="position: relative;">
        <input id="edit-path-tags" placeholder="tag" maxlength="8" style="padding-left: 24px; font-family: 'IBM Plex Sans', monospace; letter-spacing: 0.5px;" />
        <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-family: 'IBM Plex Sans', monospace; pointer-events: none;">#</span>
      </div>
      <div class="modal-actions">
        <button class="btn" id="cancel-edit-path">Cancel</button>
        <button class="btn primary" id="confirm-edit-path">Save</button>
      </div>
    </div>
  </div>

  <div class="modal-backdrop" id="delete-path-modal">
    <div class="modal">
      <h3>Delete Path</h3>
      <p style="color: var(--text-muted); margin: 16px 0;">Are you sure you want to permanently delete this path? This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn" id="cancel-delete-path">Cancel</button>
        <button class="btn" id="confirm-delete-path" style="background: #f56565; color: white;">Delete</button>
      </div>
    </div>
  </div>

  <div class="modal-backdrop" id="delete-modal">
    <div class="modal">
      <h3>Delete Achievement</h3>
      <p style="color: var(--text-muted); margin: 16px 0;">Are you sure you want to permanently delete this achievement? This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn" id="cancel-delete">Cancel</button>
        <button class="btn" id="confirm-delete" style="background: #f56565; color: white;">Delete</button>
      </div>
    </div>
  </div>

  <div class="preview-editor-backdrop" id="preview-editor-backdrop">
    <div class="preview-editor">
      <div style="font-weight: 600; font-size: 14px;">Preview editor</div>
      <div class="preview-editor-canvas" id="preview-editor-canvas">
        <img id="preview-editor-image" alt="" />
      </div>
      <div class="preview-editor-controls">
        <span>Zoom</span>
        <input type="range" id="preview-editor-zoom" min="1" max="2.5" step="0.05" value="1" />
      </div>
      <div class="modal-actions">
        <button class="btn" id="preview-editor-cancel">Cancel</button>
        <button class="btn primary" id="preview-editor-save">Save</button>
      </div>
    </div>
  </div>

  <div class="path-context-menu" id="path-context-menu">
    <button class="path-context-item" data-action="edit">Edit</button>
    <button class="path-context-item" data-action="archive">Archive</button>
    <div class="path-context-separator"></div>
    <button class="path-context-item danger" data-action="delete">Delete</button>
  </div>

  <script id="app-state" type="application/json">${stateJson}</script>
  <script>
    console.log('%c[HubUI] ✅ SCRIPT TAG LOADED - BEGIN EXECUTION', 'color: green; font-weight: bold');
    
    try {
      console.log('[HubUI] 1. Finding app-state element...');
      const stateEl = document.getElementById('app-state');
      console.log('[HubUI] 2. State element found:', !!stateEl);
      
      console.log('[HubUI] 3. Parsing JSON...');
      const state = JSON.parse(document.getElementById('app-state').textContent || '{}');
      console.log('[HubUI] 4. State loaded successfully:', state);
      showLoadingOverlay();
      
      if (!state) {
        console.error('[HubUI] ❌ State is null/undefined!');
        throw new Error('State not available');
      }
      const views = ['home', 'node', 'marketplace', 'notes', 'achievements', 'settings'];
      const topbarMeta = {
        home: { title: 'Home', subtitle: '' },
        node: { title: 'MY PATHS', subtitle: 'All paths in your system' },
        marketplace: { title: 'Marketplace', subtitle: '' },
        notes: { title: 'Notes', subtitle: '' },
        achievements: { title: 'Achievements', subtitle: 'Your earned achievements' },
        settings: { title: 'Settings', subtitle: '' }
      };
      let currentPathId = null;
      let contextMenuPathId = null;
      let editPathId = null;
      let deletePathId = null;
      let nodeViewMode = 'grid';
      const activeFilters = {
        category: 'All',
        tag: 'All',
        status: 'All',
        search: ''
      };
      let actionInFlight = false;
      let createPreviewMeta = null;
      let editPreviewMeta = null;

      function showLoadingOverlay() {
      document.body.classList.add('loading');
      }

      function hideLoadingOverlay() {
      document.body.classList.remove('loading');
      }

      async function runWithLoading(task) {
      if (actionInFlight) return null;
      actionInFlight = true;
      showLoadingOverlay();
      try {
        return await task();
      } finally {
        hideLoadingOverlay();
        actionInFlight = false;
      }
      }

      window.setActiveView = function(view) {
        console.log('[HubUI] setActiveView called with:', view);
        
        // Remove active from all nav items
        document.querySelectorAll('.nav-item').forEach((nav) => {
          nav.classList.remove('active');
        });
        
        // Add active to target nav item
        const targetNav = document.querySelector('.nav-item[data-nav="' + view + '"]');
        if (targetNav) {
          targetNav.classList.add('active');
        }
        
        // Hide all views
        views.forEach((v) => {
          const el = document.getElementById('view-' + v);
          if (el) {
            el.classList.remove('active');
          }
        });
        
        // Show target view
        const targetView = document.getElementById('view-' + view);
        if (targetView) {
          targetView.classList.add('active');
        }
        
        // Update topbar
        const meta = topbarMeta[view] || { title: view, subtitle: '' };
        const titleEl = document.getElementById('topbar-title');
        if (titleEl) titleEl.textContent = meta.title;
        const subtitleEl = document.getElementById('topbar-subtitle');
        if (subtitleEl) subtitleEl.textContent = meta.subtitle;
      };

      // SAFE NAV HANDLER (runs early to keep navigation working even if later code fails)
      document.addEventListener('click', function(event) {
        const navItem = event.target.closest('.nav-item');
        if (!navItem) return;
        const navName = navItem.getAttribute('data-nav');
        if (!navName) return;
        console.log('[HubUI] [SAFE] Nav item clicked:', navName);
        window.setActiveView(navName);
      });

      function timeAgo(dateString) {
        if (!dateString) return 'unknown';
        const diff = Date.now() - new Date(dateString).getTime();
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        if (days === 0) return 'updated today';
        if (days === 1) return 'updated 1 day ago';
        return 'updated ' + days + ' days ago';
      }

      function formatDateShort(dateString) {
        if (!dateString) return '--/--/--';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '--/--/--';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return day + '/' + month + '/' + year;
      }

      const previewPlaceholderSvg = '<svg class="preview-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M7 14l3-3 4 4 3-3 3 3" /><circle cx="9" cy="9" r="1.5" /></svg>';
      const previewPlaceholderHtml = '<div class="path-preview-placeholder">' + previewPlaceholderSvg + '</div>';

      function normalizePreviewMeta(meta) {
      const safe = meta && typeof meta === 'object' ? meta : {};
      const x = typeof safe.x === 'number' ? Math.max(0, Math.min(100, safe.x)) : 50;
      const y = typeof safe.y === 'number' ? Math.max(0, Math.min(100, safe.y)) : 50;
      const scale = typeof safe.scale === 'number' ? Math.max(1, Math.min(2.5, safe.scale)) : 1;
      return { x, y, scale };
      }

      function buildPreviewStyle(meta) {
      const safe = normalizePreviewMeta(meta);
      return 'object-position:' + safe.x + '% ' + safe.y + '%;transform:scale(' + safe.scale + ');transform-origin:' + safe.x + '% ' + safe.y + '%;';
      }

      function buildPreviewHtml(url, meta) {
      const safeUrl = String(url || '').replace(/"/g, '&quot;');
      if (!safeUrl) {
        return '<div class="path-preview">' + previewPlaceholderHtml + '</div>';
      }
      return '<div class="path-preview has-image"><img src="' + safeUrl + '" alt="" style="' + buildPreviewStyle(meta) + '" onload="this.parentElement.classList.add(\\'has-image\\')" onerror="this.parentElement.classList.remove(\\'has-image\\'); this.remove()" />' + previewPlaceholderHtml + '</div>';
      }

      function getStatus(path) {
        return (path.status || 'active').toLowerCase();
      }

      function buildFilterList(items, currentValue, targetId, type) {
      const container = document.getElementById(targetId);
      if (!container) return;
      container.innerHTML = items.map((item) => (
        '<button class="filter-item' + (item === currentValue ? ' active' : '') + '" data-filter="' + type + '" data-value="' + item + '">' + item + '</button>'
      )).join('');
      }

      window.renderNodeFilters = function(paths) {
      const categories = ['All'];
      const tags = ['All'];
      const statuses = ['All'];

      (paths || []).forEach((path) => {
        if (path.category && !categories.includes(path.category)) {
          categories.push(path.category);
        }
        const pathTags = Array.isArray(path.tags) ? path.tags : [];
        pathTags.forEach((tag) => {
          if (!tags.includes(tag)) tags.push(tag);
        });
        const status = getStatus(path);
        if (status && !statuses.includes(status)) {
          statuses.push(status);
        }
      });

      buildFilterList(categories, activeFilters.category, 'filter-categories', 'category');
      buildFilterList(tags, activeFilters.tag, 'filter-tags', 'tag');
      buildFilterList(statuses, activeFilters.status, 'filter-status', 'status');

      document.querySelectorAll('.filter-item').forEach((item) => {
        item.addEventListener('click', () => {
          const type = item.dataset.filter;
          const value = item.dataset.value;
          if (!type || !value) return;
          activeFilters[type] = value;
          renderNodeFilters(state.paths || []);
          renderNodeRegistry();
        });
      });
      }

      function matchesSearch(path, search) {
      if (!search) return true;
      const haystack = [
        path.title,
        path.description,
        ...(Array.isArray(path.tags) ? path.tags : []),
        ...(Array.isArray(path.nodes) ? path.nodes.map(n => n.title || n.description || '') : [])
      ].join(' ').toLowerCase();
      return haystack.includes(search);
      }

      function tagColors(tag) {
      let hash = 0;
      for (let i = 0; i < tag.length; i += 1) {
        hash = (hash * 31 + tag.charCodeAt(i)) | 0;
      }
      const hue = Math.abs(hash) % 360;
      const isLight = document.body.classList.contains('theme-light');
      const bg = 'hsla(' + hue + ', 70%, ' + (isLight ? 75 : 45) + '%, 0.2)';
      const border = 'hsla(' + hue + ', 70%, ' + (isLight ? 55 : 60) + '%, 0.55)';
      const text = 'hsl(' + hue + ', 70%, ' + (isLight ? 35 : 75) + '%)';
      return { bg, border, text };
      }

      window.renderNodeRegistry = function() {
      const container = document.getElementById('node-results');
      const emptyEl = document.getElementById('node-empty');
      if (!container || !emptyEl) return;

      const paths = state.paths || [];
      const filtered = paths.filter((path) => {
        const status = getStatus(path);
        const category = path.category || 'All';
        const tags = Array.isArray(path.tags) ? path.tags : [];

        const matchCategory = activeFilters.category === 'All' || category === activeFilters.category;
        const matchStatus = activeFilters.status === 'All' || status === activeFilters.status;
        const matchTag = activeFilters.tag === 'All' || tags.includes(activeFilters.tag);
        const matchSearch = matchesSearch(path, activeFilters.search);

        return matchCategory && matchStatus && matchTag && matchSearch;
      });

      container.classList.toggle('grid', nodeViewMode === 'grid');
      container.classList.toggle('list', nodeViewMode === 'list');

      if (!paths.length) {
        emptyEl.textContent = 'No paths yet. Start by creating one in Home.';
        emptyEl.style.display = 'block';
        container.innerHTML = '';
        return;
      }

      if (!filtered.length) {
        emptyEl.textContent = 'Nothing matches your filters.';
        emptyEl.style.display = 'block';
        container.innerHTML = '';
        return;
      }

      emptyEl.style.display = 'none';

      container.innerHTML = filtered.map((path) => {
        const title = path.title || 'Untitled Path';
        const description = path.description || '';
        const created = formatDateShort(path.createdAt);
        const status = getStatus(path);
        const tags = Array.isArray(path.tags) ? path.tags : [];
        const previewUrl = path.previewUrl || path.preview || '';
        const previewMeta = path.previewMeta || null;

        return (
          '<div class="path-card node-path-card" data-path-id="' + path.id + '">' +
            buildPreviewHtml(previewUrl, previewMeta) +
            '<div class="path-title">' + title + '</div>' +
            '<div class="path-desc">' + description + '</div>' +
            '<div class="path-details">' +
              '<span>• ' + created + '</span>' +
              '<span>• status: ' + status + '</span>' +
            '</div>' +
            '<div class="path-tags">' +
              (tags.length ? tags.map(t => {
                const colors = tagColors(t);
                return '<span class="tag-chip" style="--tag-bg: ' + colors.bg + '; --tag-border: ' + colors.border + '; --tag-text: ' + colors.text + ';">' + t + '</span>';
              }).join('') : '') +
            '</div>' +
          '</div>'
        );
      }).join('');
      }

      window.renderRecent = function() {
      console.log('[HubUI] renderRecent() called');
      const grid = document.getElementById('recent-grid');
      console.log('[HubUI] recent-grid element:', grid);
      if (!grid) {
        console.error('[HubUI] recent-grid NOT FOUND!');
        return;
      }
      
      grid.innerHTML = '';

      const createButton = document.createElement('button');
      createButton.className = 'create-card';
      createButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4h8"/></svg><div class="create-card-title">Create New Path</div><div class="create-card-subtitle">Start a new project</div>';
      grid.appendChild(createButton);

      if (!state.paths || state.paths.length === 0) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'empty-paths-card';
        emptyCard.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4h8"/></svg><div>Your recent paths will appear here<br/>Create your first path to get started</div>';
        grid.appendChild(emptyCard);
      } else {
        const recentPaths = (state.paths || []).slice(-5).reverse();
        recentPaths.forEach(path => {
          const nodeCount = path.nodes?.length || 0;
          const title = path.title || 'Untitled Path';
          const pathId = path.id;
          const created = formatDateShort(path.createdAt);
          const previewUrl = path.previewUrl || path.preview || '';
          const previewMeta = path.previewMeta || null;
          const pathCard = document.createElement('div');
          pathCard.className = 'path-card';
          pathCard.setAttribute('data-path-id', String(pathId));
          pathCard.innerHTML = buildPreviewHtml(previewUrl, previewMeta) + '<div class="path-card-header"><div class="path-title">' + title + '</div><div class="path-meta">' + created + '</div></div>';
          grid.appendChild(pathCard);
        });
      }

      console.log('[HubUI] state.paths count:', state.paths?.length || 0);
      };

      window.openPath = function(pathId) {
      console.log('[HubUI] window.openPath() called with pathId:', pathId);
      currentPathId = pathId;
      const path = (state.paths || []).find(p => p.id === pathId);
      console.log('[HubUI] Found path:', path);
      
      if (path) {
        console.log('[HubUI] Switching to path...');
        fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'SET_ACTIVE_PATH', payload: { pathId } })
        }).catch((e) => {
          console.warn('[HubUI] SET_ACTIVE_PATH failed (continuing):', e);
        }).finally(() => {
          window.location.href = '/ui/open-path/' + encodeURIComponent(pathId);
        });
      } else {
        console.warn('[HubUI] Path not found:', pathId);
      }
      };

      window.handlePathClick = function(pathId) {
      console.log('[HubUI] ========== handlePathClick CALLED ==========');
      console.log('[HubUI] handlePathClick called:', pathId);
      console.log('[HubUI] typeof window.openPath:', typeof window.openPath);
      window.openPath(pathId);
      };

      window.handleCreateClick = function() {
      console.log('[HubUI] handleCreateClick called');
      window.openModal();
      };

      window.openModal = function() {
      console.log('[HubUI] window.openModal() called');
      const backdrop = document.getElementById('modal-backdrop');
      if (!backdrop) {
        console.warn('[HubUI] modal-backdrop NOT FOUND');
        return;
      }
      backdrop.classList.add('open');
      backdrop.style.pointerEvents = 'auto';
      const titleInput = document.getElementById('path-title');
      if (titleInput) {
        titleInput.focus();
        console.log('[HubUI] Modal opened, focus set to input');
      } else {
        console.warn('[HubUI] path-title input NOT FOUND');
      }
      createPreviewMeta = null;
      setPreviewThumb('path-preview-thumb', document.getElementById('path-preview-url').value.trim(), createPreviewMeta);
      };

      window.closeModal = function() {
      const backdrop = document.getElementById('modal-backdrop');
      backdrop.classList.remove('open');
      backdrop.style.pointerEvents = 'none';
      document.getElementById('path-title').value = '';
      document.getElementById('path-description').value = '';
      document.getElementById('path-preview-url').value = '';
      document.getElementById('path-preview-file').value = '';
      document.getElementById('path-tags').value = '';
      createPreviewMeta = null;
      setPreviewThumb('path-preview-thumb', '', createPreviewMeta);
      };

      window.createPath = async function() {
      const confirmBtn = document.getElementById('confirm-create');
      if (confirmBtn) confirmBtn.disabled = true;
      await runWithLoading(async () => {
        const title = document.getElementById('path-title').value.trim();
        const description = document.getElementById('path-description').value.trim();
        const previewUrl = document.getElementById('path-preview-url').value.trim();
        const tagInput = document.getElementById('path-tags').value.trim().toLowerCase();
        const tags = tagInput ? [tagInput] : [];
        if (!title) {
          alert('Enter a path title');
          return;
        }
        const response = await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'CREATE_PATH', payload: { title, description, tags, previewUrl, previewMeta: createPreviewMeta } })
        });
        const data = await response.json();
        if (!data.success) {
          alert(data.error || 'Failed to create path');
          return;
        }
        state.paths = data.state.paths || [];
        window.closeModal();
        renderNodeFilters(state.paths || []);
        renderNodeRegistry();
        renderRecent();
      });
      if (confirmBtn) confirmBtn.disabled = false;
      };

      function openPathContextMenu(pathId, x, y) {
      const menu = document.getElementById('path-context-menu');
      if (!menu) return;
      contextMenuPathId = pathId;

      const path = (state.paths || []).find(p => p.id === pathId);
      const isArchived = (path?.status || 'active').toLowerCase() === 'archived';
      const archiveBtn = menu.querySelector('[data-action="archive"]');
      if (archiveBtn) {
        archiveBtn.textContent = isArchived ? 'Unarchive' : 'Archive';
        archiveBtn.dataset.mode = isArchived ? 'unarchive' : 'archive';
      }

      menu.style.left = '0px';
      menu.style.top = '0px';
      menu.classList.add('open');

      const rect = menu.getBoundingClientRect();
      const padding = 8;
      const left = Math.min(x, window.innerWidth - rect.width - padding);
      const top = Math.min(y, window.innerHeight - rect.height - padding);

      menu.style.left = Math.max(padding, left) + 'px';
      menu.style.top = Math.max(padding, top) + 'px';
      }

      function closePathContextMenu() {
      const menu = document.getElementById('path-context-menu');
      if (!menu) return;
      menu.classList.remove('open');
      contextMenuPathId = null;
      }

      function openEditPathModal(pathId) {
      const path = (state.paths || []).find(p => p.id === pathId);
      if (!path) return;
      editPathId = pathId;
      const modal = document.getElementById('edit-path-modal');
      if (!modal) return;
      const titleInput = document.getElementById('edit-path-title');
      const descInput = document.getElementById('edit-path-description');
      const tagsInput = document.getElementById('edit-path-tags');
      const previewInput = document.getElementById('edit-path-preview-url');
      if (titleInput) titleInput.value = path.title || '';
      if (descInput) descInput.value = path.description || '';
      const currentTag = Array.isArray(path.tags) ? (path.tags[0] || '') : '';
      if (tagsInput) tagsInput.value = currentTag;
      const previewUrl = path.previewUrl || path.preview || '';
      editPreviewMeta = path.previewMeta || null;
      if (previewInput) previewInput.value = previewUrl;
      setPreviewThumb('edit-path-preview-thumb', previewUrl, editPreviewMeta);
      modal.classList.add('open');
      modal.style.pointerEvents = 'auto';
      }

      function closeEditPathModal() {
      const modal = document.getElementById('edit-path-modal');
      if (!modal) return;
      modal.classList.remove('open');
      modal.style.pointerEvents = 'none';
      const editFile = document.getElementById('edit-path-preview-file');
      if (editFile) editFile.value = '';
      editPreviewMeta = null;
      editPathId = null;
      }

      function setPreviewThumb(targetId, url, meta) {
      const thumb = document.getElementById(targetId);
      if (!thumb) return;
      if (url) {
        thumb.innerHTML = '<img src="' + url + '" alt="" style="' + buildPreviewStyle(meta) + '" />';
        const img = thumb.querySelector('img');
        if (img) {
          img.addEventListener('error', () => {
            thumb.innerHTML = previewPlaceholderSvg;
          });
        }
      } else {
        thumb.innerHTML = previewPlaceholderSvg;
      }
      }

      function openPreviewEditor(options) {
      const backdrop = document.getElementById('preview-editor-backdrop');
      const canvas = document.getElementById('preview-editor-canvas');
      const img = document.getElementById('preview-editor-image');
      const zoom = document.getElementById('preview-editor-zoom');
      if (!backdrop || !canvas || !img || !zoom) return;

      let currentMeta = normalizePreviewMeta(options.meta);
      let dragStart = null;

      function applyMeta() {
        img.style.objectPosition = currentMeta.x + '% ' + currentMeta.y + '%';
        img.style.transform = 'scale(' + currentMeta.scale + ')';
        img.style.transformOrigin = currentMeta.x + '% ' + currentMeta.y + '%';
        zoom.value = String(currentMeta.scale);
      }

      img.onload = () => {
        applyMeta();
      };

      img.onerror = () => {
        alert('Preview image failed to load');
        backdrop.classList.remove('open');
      };

      img.src = options.url;
      applyMeta();
      backdrop.classList.add('open');

      canvas.onpointerdown = (event) => {
        event.preventDefault();
        canvas.classList.add('dragging');
        dragStart = {
          x: event.clientX,
          y: event.clientY,
          meta: { ...currentMeta }
        };
        canvas.setPointerCapture(event.pointerId);
      };

      canvas.onpointermove = (event) => {
        if (!dragStart) return;
        const rect = canvas.getBoundingClientRect();
        const dx = ((event.clientX - dragStart.x) / rect.width) * 100;
        const dy = ((event.clientY - dragStart.y) / rect.height) * 100;
        currentMeta.x = Math.max(0, Math.min(100, dragStart.meta.x + dx));
        currentMeta.y = Math.max(0, Math.min(100, dragStart.meta.y + dy));
        applyMeta();
      };

      canvas.onpointerup = (event) => {
        dragStart = null;
        canvas.classList.remove('dragging');
        canvas.releasePointerCapture(event.pointerId);
      };

      zoom.oninput = () => {
        currentMeta.scale = Math.max(1, Math.min(2.5, parseFloat(zoom.value)));
        applyMeta();
      };

      const saveBtn = document.getElementById('preview-editor-save');
      const cancelBtn = document.getElementById('preview-editor-cancel');
      if (saveBtn) {
        saveBtn.onclick = () => {
          if (options.onSave) options.onSave({ ...currentMeta });
          backdrop.classList.remove('open');
        };
      }
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          backdrop.classList.remove('open');
        };
      }
      }

      async function uploadPreviewFile(file) {
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/paths/upload-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      return data.url;
      }

      async function updatePath(pathId, updates) {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'UPDATE_PATH', payload: { pathId, updates } })
      });
      const data = await response.json();
      if (!data.success) {
        alert(data.error || 'Failed to update path');
        return false;
      }
      state.paths = data.state.paths || [];
      return true;
      }

      async function saveEditPath() {
      if (!editPathId) return;
      const title = document.getElementById('edit-path-title').value.trim();
      const description = document.getElementById('edit-path-description').value.trim();
      const previewUrl = document.getElementById('edit-path-preview-url').value.trim();
      const tagInput = document.getElementById('edit-path-tags').value.trim().toLowerCase();
      const tags = tagInput ? [tagInput] : [];
      if (!title) {
        alert('Enter a path title');
        return;
      }
      const ok = await runWithLoading(() => updatePath(editPathId, { title, description, tags, previewUrl, previewMeta: editPreviewMeta }));
      if (ok) {
        closeEditPathModal();
        renderNodeFilters(state.paths || []);
        renderNodeRegistry();
        renderRecent();
      }
      }

      function openDeletePathModal(pathId) {
      deletePathId = pathId;
      const modal = document.getElementById('delete-path-modal');
      if (!modal) return;
      modal.classList.add('open');
      modal.style.pointerEvents = 'auto';
      }

      function closeDeletePathModal() {
      deletePathId = null;
      const modal = document.getElementById('delete-path-modal');
      if (!modal) return;
      modal.classList.remove('open');
      modal.style.pointerEvents = 'none';
      }

      async function confirmDeletePath() {
      if (!deletePathId) return;
      const pathId = deletePathId;
      await runWithLoading(async () => {
        const response = await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'DELETE_PATH', payload: { pathId } })
        });
        const data = await response.json();
        if (!data.success) {
          alert(data.error || 'Failed to delete path');
          return;
        }
        state.paths = data.state.paths || [];
        closeDeletePathModal();
        renderNodeFilters(state.paths || []);
        renderNodeRegistry();
        renderRecent();
      });
      }

      let currentDeleteId = null;
      let achievementsViewMode = 'all'; // 'all' or 'categories'
      let achievementsCache = null;
      let achievementsLoading = null;

      async function loadAchievements(force = false) {
      if (achievementsCache && !force) return achievementsCache;
      if (achievementsLoading) return achievementsLoading;
      achievementsLoading = (async () => {
        try {
          const response = await fetch('/api/achievements/list');
          const data = await response.json();
          const list = Array.isArray(data) ? data : (data.achievements || []);
          achievementsCache = list;
          return list;
        } catch (error) {
          achievementsCache = [];
          throw error;
        } finally {
          achievementsLoading = null;
        }
      })();
      return achievementsLoading;
      }

      function renderAchievementCard(ach, showArchived) {
      const difficultyStars = '★'.repeat(Math.min(ach.difficulty || 0, 10));
      const pathTitle = (state.paths || []).find(p => p.id === ach.pathId)?.title || 'Unknown Path';
      const node = (state.paths || []).find(p => p.id === ach.pathId)?.nodes?.find(n => n.id === ach.nodeId);
      const nodeTitle = node?.title || 'Unknown Node';
      
      // Format date
      let dateStr = '';
      if (ach.unlockedAt) {
        const date = new Date(ach.unlockedAt);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        dateStr = day + '.' + month + '.' + year;
      }
      
      const cardId = 'ach-card-' + ach.id;
      
      return (
        '<div class="achievement-card" id="' + cardId + '" data-difficulty="' + (ach.difficulty || 0) + '" data-achievement-id="' + ach.id + '">' +
          '<div class="achievement-header">' +
            '<div class="achievement-icon">' + (ach.icon || '🏆') + '</div>' +
            '<div class="achievement-info">' +
              '<div class="achievement-title">' + (ach.title || 'Untitled Achievement') + '</div>' +
              '<div class="achievement-difficulty">' + difficultyStars + ' ' + (ach.difficulty || 0) + '/10</div>' +
            '</div>' +
            (ach.unlocked ? '<span class="achievement-unlocked-badge">Unlocked</span>' : '') +
          '</div>' +
          '<div class="achievement-description">' + (ach.description || 'No description') + '</div>' +
          '<div class="achievement-source">From: ' + pathTitle + ' → ' + nodeTitle + (dateStr ? ' • ' + dateStr : '') + '</div>' +
          '<div class="achievement-icon-actions">' +
            '<button class="achievement-icon-btn" data-action="' + (showArchived ? 'unarchive' : 'archive') + '" data-achievement-id="' + ach.id + '" title="' + (showArchived ? 'Unarchive' : 'Archive') + '">' + (showArchived ? '📥' : '📦') + '</button>' +
            '<button class="achievement-icon-btn danger" data-action="delete" data-achievement-id="' + ach.id + '" title="Delete">🗑️</button>' +
          '</div>' +
        '</div>'
      );
      }

      window.renderAchievements = async function(showArchived = false) {
      const container = showArchived ? document.getElementById('achievements-archive') : document.getElementById('achievements-grid');
      if (!container) return;
      
      try {
        const allAchievements = await loadAchievements();
        const achievements = allAchievements.filter(function(ach) { return showArchived ? ach.archived : !ach.archived; });
        
        if (!achievements.length) {
          container.innerHTML = '<div class="empty-state">' + (showArchived ? 'No archived achievements.' : 'No achievements yet. Complete nodes with achievements to earn them!') + '</div>';
          return;
        }

        // Режим отображения только для активных достижений
        if (!showArchived && achievementsViewMode === 'categories') {
          renderAchievementsByCategories(achievements, container);
        } else {
          // Режим "All" - показываем все достижения списком
          container.innerHTML = achievements.map(function(ach) { return renderAchievementCard(ach, showArchived); }).join('');
          checkOverflow();
        }
      } catch (error) {
        console.error('Failed to load achievements:', error);
        container.innerHTML = '<div class="empty-state">Failed to load achievements.</div>';
      }
    }

    function renderAchievementsByCategories(achievements, container) {
      // Группируем достижения по тегам
      const tagGroups = {};
      const untaggedAchievements = [];
      
      achievements.forEach(function(ach) {
        if (ach.tags && ach.tags.length > 0) {
          const tag = ach.tags[0]; // Use first tag for grouping
          if (!tagGroups[tag]) {
            tagGroups[tag] = {
              achievements: [],
              color: ach.tagColor || '#4a9eff'
            };
          }
          tagGroups[tag].achievements.push(ach);
        } else {
          untaggedAchievements.push(ach);
        }
      });

      let categoriesHTML = '';
      
      // Render tagged groups
      Object.keys(tagGroups).forEach(tag => {
        const group = tagGroups[tag];
        const achievementCount = group.achievements.length;
        
        const achievementsHTML = group.achievements.map(function(ach) { 
          return renderAchievementCard(ach, false); 
        }).join('');
        
        categoriesHTML += (
          '<div class="tag-category" data-tag="' + tag + '">' +
            '<div class="tag-category-header" style="border-left: 4px solid ' + group.color + ';">' +
              '<div class="tag-category-icon" style="color: ' + group.color + '; font-family: "IBM Plex Sans", monospace; letter-spacing: 0.5px;">#' + tag + '</div>' +
              '<div class="tag-category-info">' +
                '<div class="tag-category-count">' + achievementCount + ' achievement' + (achievementCount !== 1 ? 's' : '') + '</div>' +
              '</div>' +
              '<div class="tag-category-arrow">›</div>' +
            '</div>' +
            '<div class="tag-category-achievements">' +
              achievementsHTML +
            '</div>' +
          '</div>'
        );
      });
      
      // Render untagged achievements
      if (untaggedAchievements.length > 0) {
        const untaggedHTML = untaggedAchievements.map(function(ach) {
          return renderAchievementCard(ach, false);
        }).join('');
        
        categoriesHTML += (
          '<div class="tag-category" data-tag="untagged">' +
            '<div class="tag-category-header">' +
              '<div class="tag-category-icon" style="color: var(--text-muted); font-family: "IBM Plex Sans", monospace;">untagged</div>' +
              '<div class="tag-category-info">' +
                '<div class="tag-category-count">' + untaggedAchievements.length + ' achievement' + (untaggedAchievements.length !== 1 ? 's' : '') + '</div>' +
              '</div>' +
              '<div class="tag-category-arrow">›</div>' +
            '</div>' +
            '<div class="tag-category-achievements">' +
              untaggedHTML +
            '</div>' +
          '</div>'
        );
      }

      container.innerHTML = categoriesHTML;

      // Добавляем обработчики кликов для раскрытия категорий
      container.querySelectorAll('.tag-category-header').forEach(header => {
        header.addEventListener('click', () => {
          const category = header.closest('.tag-category');
          category.classList.toggle('expanded');
        });
      });
      
      checkOverflow();
    }

    function checkOverflow() {
      // Проверяем каждую карточку достижения на переполнение текста
      document.querySelectorAll('.achievement-card').forEach(card => {
        const description = card.querySelector('.achievement-description');
        if (description && description.scrollHeight > description.clientHeight) {
          card.classList.add('has-overflow');
        }
      });
    }

      async function archiveAchievement(id) {
      try {
        await fetch('/api/achievements/archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, archived: true })
        });
        renderAchievements(false);
        renderAchievements(true);
      } catch (error) {
        console.error('Failed to archive achievement:', error);
      }
      }

      async function unarchiveAchievement(id) {
      try {
        await fetch('/api/achievements/archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, archived: false })
        });
        achievementsCache = null;
        renderAchievements(false);
        renderAchievements(true);
      } catch (error) {
        console.error('Failed to unarchive achievement:', error);
      }
      }

      function confirmDeleteAchievement(id) {
      currentDeleteId = id;
      const deleteModal = document.getElementById('delete-modal');
      deleteModal.classList.add('open');
      deleteModal.style.pointerEvents = 'auto';
      }

      window.closeDeleteModal = function() {
      currentDeleteId = null;
      const deleteModal = document.getElementById('delete-modal');
      deleteModal.classList.remove('open');
      deleteModal.style.pointerEvents = 'none';
      }

      window.deleteAchievement = async function() {
      if (!currentDeleteId) return;
      
      try {
        await fetch('/api/achievements/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentDeleteId })
        });
        closeDeleteModal();
        achievementsCache = null;
        renderAchievements(false);
        renderAchievements(true);
      } catch (error) {
        console.error('Failed to delete achievement:', error);
        alert('Failed to delete achievement');
      }
      }

      function renderAchievements_OLD() {
      const container = document.getElementById('achievements-grid');
      if (!container) return;
      
      const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
      
      if (!achievements.length) {
        container.innerHTML = '<div class="empty-state">No achievements yet. Complete nodes with achievements to earn them!</div>';
        return;
      }
      
      container.innerHTML = achievements.map(function(ach) {
        const difficultyStars = '★'.repeat(Math.min(ach.difficulty || 0, 10));
        const pathTitle = (state.paths || []).find(p => p.id === ach.pathId)?.title || 'Unknown Path';
        const node = (state.paths || []).find(p => p.id === ach.pathId)?.nodes?.find(n => n.id === ach.nodeId);
        const nodeTitle = node?.title || 'Unknown Node';
        
        return (
          '<div class="achievement-card">' +
            '<div class="achievement-header">' +
              '<div class="achievement-icon">' + (ach.icon || '🏆') + '</div>' +
              '<div class="achievement-info">' +
                '<div class="achievement-title">' + (ach.title || 'Untitled Achievement') + '</div>' +
                '<div class="achievement-difficulty">' + difficultyStars + ' ' + (ach.difficulty || 0) + '/10</div>' +
              '</div>' +
              (ach.unlocked ? '<span class="achievement-unlocked-badge">Unlocked</span>' : '') +
            '</div>' +
            '<div class="achievement-description">' + (ach.description || 'No description') + '</div>' +
            '<div class="achievement-source">From: ' + pathTitle + ' → ' + nodeTitle + '</div>' +
          '</div>'
        );
      }).join('');
      }

      // ОБРАБОТЧИКИ КЛИКОВ - DELEGATION ДЛЯ ДИНАМИЧЕСКИХ ЭЛЕМЕНТОВ
      console.log('[HubUI] ========== INITIALIZATION STARTED ==========');

      document.addEventListener('contextmenu', function(event) {
        const pathCard = event.target.closest('.path-card');
        if (!pathCard) return;
        const pathId = pathCard.getAttribute('data-path-id');
        if (!pathId) return;
        event.preventDefault();
        openPathContextMenu(pathId, event.clientX, event.clientY);
      });

      document.addEventListener('click', function(event) {
        console.log('[HubUI] ✓ CLICK DETECTED', event.target);

        const contextItem = event.target.closest('.path-context-item');
        if (contextItem) {
          const action = contextItem.dataset.action;
          const mode = contextItem.dataset.mode;
          const pathId = contextMenuPathId;
          closePathContextMenu();

          if (!action || !pathId) return;

          if (action === 'edit') {
            openEditPathModal(pathId);
            return;
          }
          if (action === 'archive') {
            const nextStatus = mode === 'unarchive' ? 'active' : 'archived';
            updatePath(pathId, { status: nextStatus }).then((ok) => {
              if (ok) {
                renderNodeFilters(state.paths || []);
                renderNodeRegistry();
                renderRecent();
              }
            });
            return;
          }
          if (action === 'delete') {
            openDeletePathModal(pathId);
            return;
          }
        }

        if (!event.target.closest('#path-context-menu')) {
          closePathContextMenu();
        }
        
        // Navigation sidebar buttons
        const navItem = event.target.closest('.nav-item');
        if (navItem) {
          const navName = navItem.getAttribute('data-nav');
          console.log('[HubUI] ✓ Nav item clicked:', navName);
          window.setActiveView(navName);
          
          if (navName === 'node') {
            console.log('[HubUI] Rendering node registry...');
            window.renderNodeFilters(state.paths || []);
            window.renderNodeRegistry();
          } else if (navName === 'achievements') {
            console.log('[HubUI] Rendering achievements...');
            window.renderAchievements();
          } else if (navName === 'settings') {
            console.log('[HubUI] Loading settings...');
            window.loadSettings();
          } else if (navName === 'home') {
            console.log('[HubUI] Rendering recent paths...');
            window.renderRecent();
            window.location.hash = '';
          } else if (navName === 'marketplace') {
            console.log('[HubUI] Loading marketplace...');
          } else if (navName === 'notes') {
            console.log('[HubUI] Loading notes...');
          }
          return;
        }
        
        // Create Path button (rendered dynamically)
        const createBtn = event.target.closest('.create-card');
        if (createBtn) {
          console.log('[HubUI] ✓ Create button clicked');
          window.openModal();
          return;
        }

        // Path cards (rendered dynamically)
        const pathCard = event.target.closest('.path-card');
        if (pathCard) {
          if (pathCard.tagName === 'A') return;
          const pathId = pathCard.getAttribute('data-path-id');
          if (pathId) {
            console.log('[HubUI] Path card clicked:', pathId);
            window.openPath(pathId);
            return;
          }
        }

        // Modal buttons
        if (event.target.closest('#cancel-create')) {
          window.closeModal();
          return;
        }
        if (event.target.closest('#confirm-create')) {
          window.createPath();
          return;
        }
        if (event.target.closest('#cancel-edit-path')) {
          closeEditPathModal();
          return;
        }
        if (event.target.closest('#confirm-edit-path')) {
          saveEditPath();
          return;
        }
        if (event.target.closest('#cancel-delete-path')) {
          closeDeletePathModal();
          return;
        }
        if (event.target.closest('#confirm-delete-path')) {
          confirmDeletePath();
          return;
        }
        if (event.target.closest('#cancel-delete')) {
          window.closeDeleteModal();
          return;
        }
        if (event.target.closest('#confirm-delete')) {
          window.deleteAchievement();
          return;
        }

        // Achievement tabs
        const achievementTab = event.target.closest('.achievements-tab');
        if (achievementTab) {
          const tabName = achievementTab.dataset.tab;
          document.querySelectorAll('.achievements-tab').forEach(t => t.classList.remove('active'));
          achievementTab.classList.add('active');

          if (tabName === 'active') {
            document.getElementById('achievements-grid').style.display = 'grid';
            document.getElementById('achievements-archive').style.display = 'none';
            renderAchievements(false);
          } else {
            document.getElementById('achievements-grid').style.display = 'none';
            document.getElementById('achievements-archive').style.display = 'grid';
            renderAchievements(true);
          }
          return;
        }

        // Achievement action buttons (archive/unarchive/delete)
        const achievementBtn = event.target.closest('.achievement-icon-btn');
        if (achievementBtn) {
          const achievementId = achievementBtn.dataset.achievementId;
          const action = achievementBtn.dataset.action;

          if (!achievementId || !action) return;

          console.log('[HubUI] Achievement action:', action, achievementId);

          if (action === 'archive') {
            fetch('/api/achievements/archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: achievementId, archived: true })
            })
              .then(res => res.json())
              .then(() => {
                console.log('[HubUI] Achievement archived');
                achievementsCache = null;
                renderAchievements(false);
                renderAchievements(true);
              })
              .catch(err => console.error('[HubUI] Archive failed:', err));
          } else if (action === 'unarchive') {
            fetch('/api/achievements/archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: achievementId, archived: false })
            })
              .then(res => res.json())
              .then(() => {
                console.log('[HubUI] Achievement unarchived');
                achievementsCache = null;
                renderAchievements(false);
                renderAchievements(true);
              })
              .catch(err => console.error('[HubUI] Unarchive failed:', err));
          } else if (action === 'delete') {
            confirmDeleteAchievement(achievementId);
          }
          return;
        }

        // View toggle for achievements
        const viewToggleBtn = event.target.closest('.view-toggle-btn');
        if (viewToggleBtn) {
          const view = viewToggleBtn.dataset.view;
          if (!view) return;
          achievementsViewMode = view;
          document.querySelectorAll('.view-toggle-btn').forEach((toggle) => {
            toggle.classList.toggle('active', toggle.dataset.view === achievementsViewMode);
          });
          const activeTab = document.querySelector('.achievements-tab.active');
          if (activeTab && activeTab.dataset.tab === 'active') {
            renderAchievements(false);
          }
          return;
        }

        // Toggle handlers for node view mode
        const toggleBtn = event.target.closest('.toggle-btn');
        if (toggleBtn) {
          const view = toggleBtn.dataset.view;
          if (!view) return;
          nodeViewMode = view;
          document.querySelectorAll('.toggle-btn').forEach((toggle) => {
            toggle.classList.toggle('active', toggle.dataset.view === nodeViewMode);
          });
          renderNodeRegistry();
        }
      });

      // Node search handler
      const searchInput = document.getElementById('node-search');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          const value = this.value ? this.value.toLowerCase().trim() : '';
          activeFilters.search = value;
          renderNodeRegistry();
        });
      }

      // ===== SETTINGS SYSTEM =====
      let currentSettings = null;
      let settingsLoading = null;

      window.loadSettings = async function(force = false) {
        if (currentSettings && !force) {
          applySettingsToUI();
          renderModulesList();
          return currentSettings;
        }
        if (settingsLoading) return settingsLoading;
        settingsLoading = (async () => {
          try {
            const response = await fetch('/api/settings');
            if (!response.ok) throw new Error('Failed to load settings');
            currentSettings = await response.json();
            applySettingsToUI();
            renderModulesList();
            return currentSettings;
          } catch (error) {
            console.error('[HubUI] Failed to load settings:', error);
            currentSettings = {};
            return currentSettings;
          } finally {
            settingsLoading = null;
          }
        })();
        return settingsLoading;
      };

      function applySettingsToUI() {
      if (!currentSettings) return;

      // General settings - Apply theme
      const themeSelect = document.getElementById('setting-theme');
      if (themeSelect && currentSettings.general?.theme) {
        themeSelect.value = currentSettings.general.theme;
        // Apply theme to document
        const root = document.documentElement;
        if (currentSettings.general.theme === 'light') {
          // Modern Light Theme - воздушный и чистый
          root.style.setProperty('--bg', '#F7F7F9');
          root.style.setProperty('--sidebar', '#FFFFFF');
          root.style.setProperty('--panel', '#EDEEF0');
          root.style.setProperty('--text', '#111827');
          root.style.setProperty('--text-muted', '#6B7280');
          root.style.setProperty('--text-subtle', '#9CA3AF');
          root.style.setProperty('--border', '#E5E7EB');
          root.style.setProperty('--border-subtle', '#F3F4F6');
          root.style.setProperty('--card-bg', '#FFFFFF');
          root.style.setProperty('--card-hover', '#F9FAFB');
          root.style.setProperty('--status-green', '#10B981');
          root.style.setProperty('--status-yellow', '#F59E0B');
          root.style.setProperty('--status-gray', '#9CA3AF');
          
          // Логотип PATH# становится тёмным
          document.body.classList.add('theme-light');
          document.body.classList.remove('theme-dark');
        } else {
          // Dark Theme - оригинальная
          root.style.setProperty('--bg', '#0d0d0d');
          root.style.setProperty('--sidebar', '#141414');
          root.style.setProperty('--panel', '#1a1a1a');
          root.style.setProperty('--text', '#e5e5e5');
          root.style.setProperty('--text-muted', '#8c8c8c');
          root.style.setProperty('--text-subtle', '#5a5a5a');
          root.style.setProperty('--border', '#252525');
          root.style.setProperty('--border-subtle', '#1f1f1f');
          root.style.setProperty('--card-bg', '#1a1a1a');
          root.style.setProperty('--card-hover', '#202020');
          root.style.setProperty('--status-green', '#52c41a');
          root.style.setProperty('--status-yellow', '#faad14');
          root.style.setProperty('--status-gray', '#434343');
          
          // Логотип PATH# остается белым
          document.body.classList.add('theme-dark');
          document.body.classList.remove('theme-light');
        }
      }

      const langSelect = document.getElementById('setting-language');
      if (langSelect && currentSettings.general?.language) {
        langSelect.value = currentSettings.general.language;
      }

      // Nodes & Hub settings
      const toggles = [
        { id: 'setting-grid-display', key: 'nodes_hub.grid_display' },
        { id: 'setting-highlight-active', key: 'nodes_hub.highlight_active_nodes' },
        { id: 'setting-autosave-nodes', key: 'nodes_hub.autosave_nodes' },
        { id: 'setting-quick-chain', key: 'nodes_hub.quick_chain_mode' },
        { id: 'setting-show-notifications', key: 'achievements.show_notifications' },
        { id: 'setting-display-difficulty', key: 'achievements.display_difficulty' },
        { id: 'setting-dependency-check', key: 'modules_plugins.dependency_check' },
        { id: 'setting-sequence-enabled', key: 'sequence_editor.enabled' },
        { id: 'setting-sequence-auto-create', key: 'sequence_editor.auto_create' },
        { id: 'setting-sequence-auto-connect', key: 'sequence_editor.auto_connect' },
        { id: 'setting-engine-logs', key: 'developer.engine_logs' },
        { id: 'setting-ui-debug', key: 'developer.ui_debug_mode' }
      ];

      toggles.forEach(function({ id, key }) {
        const el = document.getElementById(id);
        if (el) {
          const parts = key.split('.');
          const section = parts[0];
          const field = parts[1];
          const value = currentSettings[section] && currentSettings[section][field] != null ? currentSettings[section][field] : false;
          el.checked = Boolean(value);
          const switchEl = el.closest('.toggle-switch');
          if (switchEl) {
            switchEl.classList.toggle('active', Boolean(value));
          }

          // Apply visual changes based on setting
          if (id === 'setting-display-difficulty') {
            // Hide/show difficulty indicators on achievements
            const diffElements = document.querySelectorAll('.achievement-difficulty');
            diffElements.forEach(function(el) {
              el.style.display = value ? 'block' : 'none';
            });
          }
        }
      });
      }

      function renderModulesList() {
      if (!currentSettings) return;

      // Render active modules
      const modulesList = document.getElementById('active-modules-list');
      if (modulesList && currentSettings.modules_plugins?.active_modules) {
        modulesList.innerHTML = currentSettings.modules_plugins.active_modules
          .map(function(m) { return '<span class="module-badge">' + m + '</span>'; })
          .join('');
      }

      // Render active extensions
      const extensionsList = document.getElementById('active-extensions-list');
      if (extensionsList && currentSettings.modules_plugins?.active_extensions) {
        extensionsList.innerHTML = currentSettings.modules_plugins.active_extensions
          .map(function(e) { return '<span class="module-badge">' + e + '</span>'; })
          .join('');
      }
      }

      async function saveSettings() {
      try {
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSettings)
        });
        
        if (!response.ok) throw new Error('Failed to save settings');
        
        // Show success message
        const statusEl = document.getElementById('settings-status');
        if (statusEl) {
          statusEl.style.display = 'block';
          setTimeout(() => {
            statusEl.style.display = 'none';
          }, 2000);
        }
      } catch (error) {
        console.error('[HubUI] Failed to save settings:', error);
        alert('Failed to save settings');
      }
      }

      // Settings toggle handlers
      const toggleIds = [
      'setting-grid-display',
      'setting-highlight-active',
      'setting-autosave-nodes',
      'setting-quick-chain',
      'setting-show-notifications',
      'setting-display-difficulty',
      'setting-dependency-check',
      'setting-sequence-enabled',
      'setting-sequence-auto-create',
      'setting-sequence-auto-connect',
      'setting-engine-logs',
      'setting-ui-debug'
      ];

      toggleIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', function() {
          const switchEl = this.closest('.toggle-switch');
          if (switchEl) {
            switchEl.classList.toggle('active', this.checked);
          }

          // Update settings object based on toggle
          const keyMap = {
            'setting-grid-display': 'nodes_hub.grid_display',
            'setting-highlight-active': 'nodes_hub.highlight_active_nodes',
            'setting-autosave-nodes': 'nodes_hub.autosave_nodes',
            'setting-quick-chain': 'nodes_hub.quick_chain_mode',
            'setting-show-notifications': 'achievements.show_notifications',
            'setting-display-difficulty': 'achievements.display_difficulty',
            'setting-dependency-check': 'modules_plugins.dependency_check',
            'setting-sequence-enabled': 'sequence_editor.enabled',
            'setting-sequence-auto-create': 'sequence_editor.auto_create',
            'setting-sequence-auto-connect': 'sequence_editor.auto_connect',
            'setting-engine-logs': 'developer.engine_logs',
            'setting-ui-debug': 'developer.ui_debug_mode'
          };

          const key = keyMap[id];
          if (key) {
            const [section, field] = key.split('.');
            if (!currentSettings[section]) currentSettings[section] = {};
            currentSettings[section][field] = this.checked;
            saveSettings();
          }
        });
      }
      });

      // Select handlers
      const themeSelect = document.getElementById('setting-theme');
      if (themeSelect) {
      themeSelect.addEventListener('change', function() {
        if (!currentSettings.general) currentSettings.general = {};
        currentSettings.general.theme = this.value;
        
        // Apply theme immediately
        const root = document.documentElement;
        if (this.value === 'light') {
          // Modern Light Theme
          root.style.setProperty('--bg', '#F7F7F9');
          root.style.setProperty('--sidebar', '#FFFFFF');
          root.style.setProperty('--panel', '#EDEEF0');
          root.style.setProperty('--text', '#111827');
          root.style.setProperty('--text-muted', '#6B7280');
          root.style.setProperty('--text-subtle', '#9CA3AF');
          root.style.setProperty('--border', '#E5E7EB');
          root.style.setProperty('--border-subtle', '#F3F4F6');
          root.style.setProperty('--card-bg', '#FFFFFF');
          root.style.setProperty('--card-hover', '#F9FAFB');
          root.style.setProperty('--status-green', '#10B981');
          root.style.setProperty('--status-yellow', '#F59E0B');
          root.style.setProperty('--status-gray', '#9CA3AF');
          
          document.body.classList.add('theme-light');
          document.body.classList.remove('theme-dark');
        } else {
          // Dark Theme
          root.style.setProperty('--bg', '#0d0d0d');
          root.style.setProperty('--sidebar', '#141414');
          root.style.setProperty('--panel', '#1a1a1a');
          root.style.setProperty('--text', '#e5e5e5');
          root.style.setProperty('--text-muted', '#8c8c8c');
          root.style.setProperty('--text-subtle', '#5a5a5a');
          root.style.setProperty('--border', '#252525');
          root.style.setProperty('--border-subtle', '#1f1f1f');
          root.style.setProperty('--card-bg', '#1a1a1a');
          root.style.setProperty('--card-hover', '#202020');
          root.style.setProperty('--status-green', '#52c41a');
          root.style.setProperty('--status-yellow', '#faad14');
          root.style.setProperty('--status-gray', '#434343');
          
          document.body.classList.add('theme-dark');
          document.body.classList.remove('theme-light');
        }
        
        saveSettings();
      });
      }

      const langSelect = document.getElementById('setting-language');
      if (langSelect) {
      langSelect.addEventListener('change', function() {
        if (!currentSettings.general) currentSettings.general = {};
        currentSettings.general.language = this.value;
        saveSettings();
      });
      }

      // Reset button
      const resetBtn = document.getElementById('reset-settings-btn');
      if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (confirm('Reset all settings to defaults?')) {
          currentSettings = {
            general: { theme: 'dark', language: 'ru', reset_settings: false },
            nodes_hub: { grid_display: true, highlight_active_nodes: true, autosave_nodes: true, quick_chain_mode: true },
            achievements: { show_notifications: true, display_difficulty: true },
            modules_plugins: { active_modules: ['path-module', 'node-module', 'hub-module', 'year-module'], active_extensions: ['hub-ui', 'node-ui'], dependency_check: true },
            developer: { engine_logs: false, clear_cache: false, ui_debug_mode: false }
          };
          saveSettings();
          applySettingsToUI();
        }
      });
      }

      // Clear cache button
      const clearCacheBtn = document.getElementById('clear-cache-btn');
      if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', function() {
        if (confirm('Clear achievement cache?')) {
          localStorage.removeItem('achievements');
          renderAchievements(false);
          renderAchievements(true);
        }
      });
      }

      const createPreviewUrl = document.getElementById('path-preview-url');
      const createPreviewFileBtn = document.getElementById('path-preview-file-btn');
      const createPreviewFile = document.getElementById('path-preview-file');
      const createPreviewEdit = document.getElementById('path-preview-edit');
      const createPreviewClear = document.getElementById('path-preview-clear');

      if (createPreviewUrl) {
        createPreviewUrl.addEventListener('input', () => {
          setPreviewThumb('path-preview-thumb', createPreviewUrl.value.trim(), createPreviewMeta);
        });
        createPreviewUrl.addEventListener('change', () => {
          const value = createPreviewUrl.value.trim();
          if (!value) return;
          createPreviewMeta = normalizePreviewMeta(null);
          openPreviewEditor({
            url: value,
            meta: createPreviewMeta,
            onSave: (meta) => {
              createPreviewMeta = meta;
              setPreviewThumb('path-preview-thumb', value, createPreviewMeta);
            }
          });
        });
      }

      if (createPreviewFileBtn && createPreviewFile) {
        createPreviewFileBtn.addEventListener('click', () => createPreviewFile.click());
        createPreviewFile.addEventListener('change', async () => {
          const file = createPreviewFile.files && createPreviewFile.files[0];
          if (!file) return;
          try {
            const url = await uploadPreviewFile(file);
            if (createPreviewUrl) createPreviewUrl.value = url;
            createPreviewMeta = normalizePreviewMeta(null);
            setPreviewThumb('path-preview-thumb', url, createPreviewMeta);
            openPreviewEditor({
              url,
              meta: createPreviewMeta,
              onSave: (meta) => {
                createPreviewMeta = meta;
                setPreviewThumb('path-preview-thumb', url, createPreviewMeta);
              }
            });
          } catch (error) {
            console.error('[HubUI] Preview upload failed:', error);
            alert('Failed to upload preview');
          }
        });
      }

      if (createPreviewClear) {
        createPreviewClear.addEventListener('click', () => {
          if (createPreviewUrl) createPreviewUrl.value = '';
          createPreviewMeta = null;
          setPreviewThumb('path-preview-thumb', '', createPreviewMeta);
        });
      }

      if (createPreviewEdit) {
        createPreviewEdit.addEventListener('click', () => {
          const value = createPreviewUrl ? createPreviewUrl.value.trim() : '';
          if (!value) return;
          createPreviewMeta = normalizePreviewMeta(createPreviewMeta);
          openPreviewEditor({
            url: value,
            meta: createPreviewMeta,
            onSave: (meta) => {
              createPreviewMeta = meta;
              setPreviewThumb('path-preview-thumb', value, createPreviewMeta);
            }
          });
        });
      }

      const editPreviewUrl = document.getElementById('edit-path-preview-url');
      const editPreviewFileBtn = document.getElementById('edit-path-preview-file-btn');
      const editPreviewFile = document.getElementById('edit-path-preview-file');
      const editPreviewEdit = document.getElementById('edit-path-preview-edit');
      const editPreviewClear = document.getElementById('edit-path-preview-clear');

      if (editPreviewUrl) {
        editPreviewUrl.addEventListener('input', () => {
          setPreviewThumb('edit-path-preview-thumb', editPreviewUrl.value.trim(), editPreviewMeta);
        });
        editPreviewUrl.addEventListener('change', () => {
          const value = editPreviewUrl.value.trim();
          if (!value) return;
          editPreviewMeta = normalizePreviewMeta(null);
          openPreviewEditor({
            url: value,
            meta: editPreviewMeta,
            onSave: (meta) => {
              editPreviewMeta = meta;
              setPreviewThumb('edit-path-preview-thumb', value, editPreviewMeta);
            }
          });
        });
      }

      if (editPreviewFileBtn && editPreviewFile) {
        editPreviewFileBtn.addEventListener('click', () => editPreviewFile.click());
        editPreviewFile.addEventListener('change', async () => {
          const file = editPreviewFile.files && editPreviewFile.files[0];
          if (!file) return;
          try {
            const url = await uploadPreviewFile(file);
            if (editPreviewUrl) editPreviewUrl.value = url;
            editPreviewMeta = normalizePreviewMeta(null);
            setPreviewThumb('edit-path-preview-thumb', url, editPreviewMeta);
            openPreviewEditor({
              url,
              meta: editPreviewMeta,
              onSave: (meta) => {
                editPreviewMeta = meta;
                setPreviewThumb('edit-path-preview-thumb', url, editPreviewMeta);
              }
            });
          } catch (error) {
            console.error('[HubUI] Preview upload failed:', error);
            alert('Failed to upload preview');
          }
        });
      }

      if (editPreviewClear) {
        editPreviewClear.addEventListener('click', () => {
          if (editPreviewUrl) editPreviewUrl.value = '';
          editPreviewMeta = null;
          setPreviewThumb('edit-path-preview-thumb', '', editPreviewMeta);
        });
      }

      if (editPreviewEdit) {
        editPreviewEdit.addEventListener('click', () => {
          const value = editPreviewUrl ? editPreviewUrl.value.trim() : '';
          if (!value) return;
          editPreviewMeta = normalizePreviewMeta(editPreviewMeta);
          openPreviewEditor({
            url: value,
            meta: editPreviewMeta,
            onSave: (meta) => {
              editPreviewMeta = meta;
              setPreviewThumb('edit-path-preview-thumb', value, editPreviewMeta);
            }
          });
        });
      }

      // ИНИЦИАЛИЗАЦИЯ: загружаем начальный вид
      async function initializeHub() {
      console.log('[HubUI] ✅ Starting initialization...');
      try {
        await Promise.allSettled([
          loadSettings(),
          loadAchievements()
        ]);

        console.log('[HubUI] About to setActiveView(home)...');
        window.setActiveView('home');
        console.log('[HubUI] About to renderRecent()...');
        window.renderRecent();
        console.log('[HubUI] renderRecent() done');
        window.renderNodeFilters(state.paths || []);
        window.renderNodeRegistry();

        await Promise.allSettled([
          window.renderAchievements(false),
          window.renderAchievements(true)
        ]);
        console.log('[HubUI] ========== INITIALIZATION COMPLETE ==========');
      } finally {
        hideLoadingOverlay();
      }
      }

      initializeHub();
    console.log('[HubUI] Click handlers attached via onclick attributes in HTML');
    console.log('[HubUI] State paths:', (state.paths || []).length, 'paths loaded');
    } catch (error) {
      console.error('%c[HubUI] ❌ FATAL ERROR IN SCRIPT', 'color: red; font-weight: bold', error);
      console.error('Error details:', error.message, error.stack);
      hideLoadingOverlay();
      throw error;
    }
  </script>
</body>
</html>
    `;
  }
}

export default HubUIPlugin;


