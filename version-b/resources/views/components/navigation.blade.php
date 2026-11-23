@props(['links', 'itemClass', 'listClass'])
<ul class="{{ $listClass }}">
    @foreach($links as [$label, $target, $category])
        <li><x-section-link :$target :$category :class="$itemClass">{{ $label }}</x-section-link></li>
    @endforeach
</ul>
