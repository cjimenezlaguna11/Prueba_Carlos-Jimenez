@props(['field', 'label', 'type', 'autocomplete'])
<div class="contact-panel__row">
    <label for="contact-{{ $field }}" class="contact-panel__label">{{ $label }} <span aria-hidden="true">*</span></label>
    @if($type)
        <input id="contact-{{ $field }}" class="field contact-panel__input" type="{{ $type }}" autocomplete="{{ $autocomplete }}" required>
    @else
        <textarea id="contact-{{ $field }}" class="field contact-panel__message" rows="5" required></textarea>
    @endif
    <p id="contact-{{ $field }}-errore" class="contact-panel__error" hidden><x-icon name="alert" :size="16" /><span></span></p>
</div>
