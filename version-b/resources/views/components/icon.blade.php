@props(['name', 'size' => 20])
<svg width="{{ $size }}" height="{{ $size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icon">
    @switch($name)
        @case('sun') <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /> @break
        @case('moon') <path d="M20.9 13.35A9 9 0 0 1 10.65 3.1 9 9 0 1 0 20.9 13.35Z" /> @break
        @case('monitor') <rect x="3" y="4" width="18" height="13" rx="2" /><path d="M12 17v4m-4 0h8" /> @break
        @case('cart') <path d="M2 3h3l2.4 12h11.2l3-9H6" /><circle cx="9" cy="20" r="1.25" /><circle cx="18" cy="20" r="1.25" /> @break
        @case('plus') <path d="M5 12h14M12 5v14" /> @break
        @case('minus') <path d="M5 12h14" /> @break
        @case('trash') <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" /> @break
        @case('instagram') <rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17 7h.01" /> @break
        @case('linkedin') <rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 11v5M8 8h.01M12 16v-5M12 13c0-1.5 1-2 2-2s2 .7 2 2v3" /> @break
        @case('youtube') <rect x="3" y="6" width="18" height="12" rx="4" /><path d="m10.5 9.5 4 2.5-4 2.5z" /> @break
        @case('facebook') <path d="M14 8h2.5V4.5H14C11.8 4.5 10.5 6 10.5 8v2H8v3.5h2.5V20H14v-6.5h2.5L17 10h-3V8.5c0-.3.2-.5.5-.5" /> @break
        @case('search') <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /> @break
        @case('menu') <path d="M4 7h16M4 12h16M4 17h16" /> @break
        @case('close') <path d="M6 6l12 12M18 6 6 18" /> @break
        @case('x') <path d="M6 6l12 12M18 6 6 18" /> @break
        @case('user') <circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /> @break
        @case('users') <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.3-5 6.5-5s5.700 1.500 6.500 5M16 5a3.500 3.500 0 0 1 0 7M18 15c2 .6 3.200 2.200 3.500 5" /> @break
        @case('cal') <rect x="3.500" y="5" width="17" height="15" rx="2" /><path d="M3.500 10h17M8 3v4M16 3v4" /> @break
        @case('arrow') <path d="M5 12h14M13 6l6 6-6 6" /> @break
        @case('check') <path d="m5 12.500 4.500 4.500L19 7.500" /> @break
        @case('alert') <circle cx="12" cy="12" r="9" /><path d="M12 7.500v5M12 16h.01" /> @break
        @case('layers') <path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /> @break
        @case('doc') <path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /> @break
        @case('grow') <path d="M4 20h16M7 16v-4M12 16V8M17 16V4" /> @break
        @case('mail') <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.500 7 8.500 6 8.500-6" /> @break
    @endswitch
</svg>
