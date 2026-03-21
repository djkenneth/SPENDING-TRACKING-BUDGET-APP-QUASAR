<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>SpendWise — Smart Budget Tracker</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
        <style>
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            html { scroll-behavior: smooth; }
            body {
                font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
                background: #0f0f13;
                color: #f0f0f0;
                min-height: 100vh;
                overflow-x: hidden;
            }

            /* ── Nav ── */
            nav {
                position: fixed; top: 0; left: 0; right: 0; z-index: 50;
                display: flex; align-items: center; justify-content: space-between;
                padding: 1rem 2rem;
                background: rgba(15, 15, 19, 0.8);
                backdrop-filter: blur(12px);
                border-bottom: 1px solid rgba(255,255,255,0.06);
            }
            .nav-logo {
                font-size: 1.125rem; font-weight: 700; letter-spacing: -0.02em;
                display: flex; align-items: center; gap: 0.5rem;
            }
            .nav-logo span { color: #6366f1; }
            .nav-links { display: flex; align-items: center; gap: 0.75rem; }
            .btn-ghost {
                padding: 0.5rem 1.25rem; border-radius: 0.5rem;
                font-size: 0.875rem; font-weight: 500; color: #a1a1aa;
                text-decoration: none; transition: color 0.15s;
                border: 1px solid transparent;
            }
            .btn-ghost:hover { color: #f0f0f0; border-color: rgba(255,255,255,0.1); }
            .btn-primary {
                padding: 0.5rem 1.25rem; border-radius: 0.5rem;
                font-size: 0.875rem; font-weight: 600; color: #fff;
                text-decoration: none; transition: opacity 0.15s;
                background: #6366f1;
            }
            .btn-primary:hover { opacity: 0.88; }

            /* ── Hero ── */
            .hero {
                padding: 10rem 2rem 6rem;
                text-align: center;
                position: relative;
            }
            .hero::before {
                content: '';
                position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
                width: 900px; height: 500px;
                background: radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%);
                pointer-events: none;
            }
            .badge {
                display: inline-flex; align-items: center; gap: 0.375rem;
                padding: 0.25rem 0.875rem; border-radius: 9999px;
                font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em;
                background: rgba(99,102,241,0.12); color: #818cf8;
                border: 1px solid rgba(99,102,241,0.25);
                margin-bottom: 1.5rem;
            }
            .hero h1 {
                font-size: clamp(2.5rem, 6vw, 4.5rem);
                font-weight: 700; letter-spacing: -0.04em; line-height: 1.05;
                margin-bottom: 1.5rem;
            }
            .hero h1 em { font-style: normal; color: #818cf8; }
            .hero p {
                font-size: 1.125rem; color: #71717a; max-width: 520px;
                margin: 0 auto 2.5rem; line-height: 1.7;
            }
            .hero-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
            .btn-lg {
                padding: 0.75rem 2rem; border-radius: 0.625rem;
                font-size: 1rem; font-weight: 600; text-decoration: none;
                transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.5rem;
            }
            .btn-lg.primary { background: #6366f1; color: #fff; }
            .btn-lg.primary:hover { background: #5558e8; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.35); }
            .btn-lg.outline {
                background: transparent; color: #a1a1aa;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .btn-lg.outline:hover { color: #f0f0f0; border-color: rgba(255,255,255,0.2); }

            /* ── Stats strip ── */
            .stats {
                display: flex; justify-content: center; flex-wrap: wrap; gap: 0;
                max-width: 680px; margin: 4rem auto;
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 1rem; overflow: hidden;
                background: rgba(255,255,255,0.02);
            }
            .stat-item {
                flex: 1; min-width: 140px; padding: 1.75rem 1.5rem; text-align: center;
                border-right: 1px solid rgba(255,255,255,0.06);
            }
            .stat-item:last-child { border-right: none; }
            .stat-value {
                font-size: 1.75rem; font-weight: 700; letter-spacing: -0.03em;
                color: #f0f0f0; line-height: 1;
            }
            .stat-label { font-size: 0.8rem; color: #52525b; margin-top: 0.375rem; }

            /* ── Features ── */
            .section { padding: 5rem 2rem; max-width: 1100px; margin: 0 auto; }
            .section-label {
                text-align: center; font-size: 0.75rem; font-weight: 600;
                letter-spacing: 0.1em; color: #6366f1; text-transform: uppercase;
                margin-bottom: 0.75rem;
            }
            .section-title {
                text-align: center; font-size: clamp(1.75rem, 4vw, 2.5rem);
                font-weight: 700; letter-spacing: -0.03em; margin-bottom: 1rem;
            }
            .section-sub { text-align: center; color: #71717a; max-width: 480px; margin: 0 auto 3rem; line-height: 1.7; }
            .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; }
            .card {
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 1rem; padding: 1.75rem;
                transition: border-color 0.2s, transform 0.2s;
            }
            .card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
            .card-icon {
                width: 2.5rem; height: 2.5rem; border-radius: 0.625rem;
                display: flex; align-items: center; justify-content: center;
                margin-bottom: 1rem; font-size: 1.125rem;
            }
            .card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; }
            .card p { font-size: 0.875rem; color: #71717a; line-height: 1.6; }

            /* icon bg tints */
            .tint-indigo { background: rgba(99,102,241,0.12); }
            .tint-emerald { background: rgba(16,185,129,0.12); }
            .tint-amber  { background: rgba(245,158,11,0.12); }
            .tint-rose   { background: rgba(244,63,94,0.12); }
            .tint-sky    { background: rgba(14,165,233,0.12); }
            .tint-violet { background: rgba(139,92,246,0.12); }

            /* ── Dashboard preview ── */
            .preview-wrap {
                max-width: 860px; margin: 0 auto;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 1.25rem; overflow: hidden;
                background: #16161d;
                box-shadow: 0 40px 80px rgba(0,0,0,0.5);
            }
            .preview-bar {
                display: flex; align-items: center; gap: 0.5rem;
                padding: 0.875rem 1.25rem;
                background: #1a1a24;
                border-bottom: 1px solid rgba(255,255,255,0.06);
            }
            .dot { width: 10px; height: 10px; border-radius: 50%; }
            .dot-red { background: #ff5f57; }
            .dot-yellow { background: #febc2e; }
            .dot-green { background: #28c840; }
            .preview-body { padding: 1.5rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
            .mini-card {
                background: #1e1e2a; border-radius: 0.75rem; padding: 1.25rem;
                border: 1px solid rgba(255,255,255,0.05);
            }
            .mini-card .label { font-size: 0.7rem; color: #52525b; margin-bottom: 0.375rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
            .mini-card .amount { font-size: 1.375rem; font-weight: 700; letter-spacing: -0.02em; }
            .mini-card .change { font-size: 0.75rem; margin-top: 0.25rem; }
            .up { color: #10b981; }
            .down { color: #f43f5e; }
            .bar-row { margin-top: 1rem; }
            .bar-label { display: flex; justify-content: space-between; font-size: 0.7rem; color: #71717a; margin-bottom: 0.375rem; }
            .bar-bg { background: rgba(255,255,255,0.06); border-radius: 9999px; height: 6px; }
            .bar-fill { height: 6px; border-radius: 9999px; }
            .preview-bottom { grid-column: 1 / -1; }

            /* ── CTA ── */
            .cta-section {
                padding: 5rem 2rem; text-align: center;
                background: linear-gradient(to bottom, transparent, rgba(99,102,241,0.06), transparent);
            }
            .cta-section h2 {
                font-size: clamp(1.75rem, 4vw, 2.75rem);
                font-weight: 700; letter-spacing: -0.03em; margin-bottom: 1rem;
            }
            .cta-section p { color: #71717a; margin-bottom: 2rem; font-size: 1.0625rem; }

            /* ── Footer ── */
            footer {
                border-top: 1px solid rgba(255,255,255,0.06);
                padding: 2rem; text-align: center;
                font-size: 0.8rem; color: #3f3f46;
            }
        </style>
    </head>
    <body>

        {{-- Nav --}}
        <nav>
            <div class="nav-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#6366f1"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Spend<span>Wise</span>
            </div>
            @if (Route::has('login'))
                <div class="nav-links">
                    @auth
                        <a href="{{ url('/dashboard') }}" class="btn-ghost">Dashboard</a>
                    @else
                        <a href="{{ route('login') }}" class="btn-ghost">Sign in</a>
                        @if (Route::has('register'))
                            <a href="{{ route('register') }}" class="btn-primary">Get started</a>
                        @endif
                    @endauth
                </div>
            @endif
        </nav>

        {{-- Hero --}}
        <section class="hero">
            <div class="badge">✦ Smart personal finance</div>
            <h1>Take control of<br><em>every dollar</em> you spend</h1>
            <p>Track spending, set budgets, and hit your savings goals — all in one beautifully simple dashboard.</p>
            <div class="hero-actions">
                @if (Route::has('register'))
                    <a href="{{ route('register') }}" class="btn-lg primary">
                        Start for free
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                @endif
                <a href="{{ route('login') }}" class="btn-lg outline">Sign in</a>
            </div>
        </section>

        {{-- Stats --}}
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">∞</div>
                <div class="stat-label">Transactions tracked</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">12+</div>
                <div class="stat-label">Budget categories</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">Real-time</div>
                <div class="stat-label">Spending insights</div>
            </div>
        </div>

        {{-- Dashboard Preview --}}
        <div style="padding: 0 2rem 5rem; max-width: 900px; margin: 0 auto;">
            <div class="preview-wrap">
                <div class="preview-bar">
                    <span class="dot dot-red"></span>
                    <span class="dot dot-yellow"></span>
                    <span class="dot dot-green"></span>
                    <span style="margin-left: 0.75rem; font-size: 0.75rem; color: #52525b;">SpendWise — Dashboard</span>
                </div>
                <div class="preview-body">
                    <div class="mini-card">
                        <div class="label">Net Worth</div>
                        <div class="amount" style="color:#f0f0f0;">$24,850</div>
                        <div class="change up">↑ 3.2% this month</div>
                    </div>
                    <div class="mini-card">
                        <div class="label">Monthly Income</div>
                        <div class="amount" style="color:#10b981;">$5,200</div>
                        <div class="change up">↑ On track</div>
                    </div>
                    <div class="mini-card">
                        <div class="label">Monthly Expenses</div>
                        <div class="amount" style="color:#f43f5e;">$3,140</div>
                        <div class="change down">↑ 8% vs last month</div>
                    </div>
                    <div class="mini-card preview-bottom" style="grid-column: 1 / -1;">
                        <div class="label" style="margin-bottom: 1rem;">Budget progress</div>
                        <div class="bar-row">
                            <div class="bar-label"><span>Food & Dining</span><span>$620 / $800</span></div>
                            <div class="bar-bg"><div class="bar-fill" style="width:77%; background:#6366f1;"></div></div>
                        </div>
                        <div class="bar-row" style="margin-top:0.75rem;">
                            <div class="bar-label"><span>Transport</span><span>$210 / $300</span></div>
                            <div class="bar-bg"><div class="bar-fill" style="width:70%; background:#10b981;"></div></div>
                        </div>
                        <div class="bar-row" style="margin-top:0.75rem;">
                            <div class="bar-label"><span>Entertainment</span><span>$380 / $350</span></div>
                            <div class="bar-bg"><div class="bar-fill" style="width:100%; background:#f43f5e;"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Features --}}
        <section class="section">
            <div class="section-label">Features</div>
            <h2 class="section-title">Everything you need to budget smarter</h2>
            <p class="section-sub">From daily expense tracking to long-term goal planning — built for real life.</p>
            <div class="grid-3">
                <div class="card">
                    <div class="card-icon tint-indigo">📊</div>
                    <h3>Smart Budgets</h3>
                    <p>Set monthly or recurring budgets per category and get alerts before you overspend.</p>
                </div>
                <div class="card">
                    <div class="card-icon tint-emerald">💰</div>
                    <h3>Transaction Tracking</h3>
                    <p>Log income and expenses instantly. Filter, search, and categorise with ease.</p>
                </div>
                <div class="card">
                    <div class="card-icon tint-amber">🎯</div>
                    <h3>Savings Goals</h3>
                    <p>Define goals — holiday, emergency fund, new car — and track progress automatically.</p>
                </div>
                <div class="card">
                    <div class="card-icon tint-rose">📅</div>
                    <h3>Bill Reminders</h3>
                    <p>Never miss a payment. Get reminders for upcoming bills and subscriptions.</p>
                </div>
                <div class="card">
                    <div class="card-icon tint-sky">📈</div>
                    <h3>Spending Analytics</h3>
                    <p>See where your money actually goes with monthly trends and category breakdowns.</p>
                </div>
                <div class="card">
                    <div class="card-icon tint-violet">🏦</div>
                    <h3>Multi-Account</h3>
                    <p>Connect multiple bank accounts and track net worth across all your assets.</p>
                </div>
            </div>
        </section>

        {{-- CTA --}}
        <section class="cta-section">
            <h2>Ready to take control?</h2>
            <p>Join and start tracking your spending in under a minute.</p>
            @if (Route::has('register'))
                <a href="{{ route('register') }}" class="btn-lg primary" style="display: inline-flex;">
                    Create free account
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
            @endif
        </section>

        <footer>
            &copy; {{ date('Y') }} SpendWise. Built with Laravel &amp; Quasar.
        </footer>

    </body>
</html>
