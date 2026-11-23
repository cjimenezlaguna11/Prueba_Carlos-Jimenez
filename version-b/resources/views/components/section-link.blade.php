@props(['target', 'category' => null])
<a href="#{{ $target }}" data-section-link @if($category) data-nav-category="{{ $category }}" @endif {{ $attributes }}>{{ $slot }}</a>
