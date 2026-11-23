@props(['icon', 'label'])
<li class="metadata__row">
    <span class="metadata__icon"><x-icon :name="$icon" :size="16" /></span>
    <p><strong>{{ $label }}:</strong> <span>{{ $slot }}</span></p>
</li>
