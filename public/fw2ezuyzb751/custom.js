// const initToggleSwitch = (name = 'input[toggle-switch]') => {
//     $(name).each(function () {
//         $(this).bootstrapSwitch('state', $(this).prop('checked'));
//     });
// };
//
// $(document).ready(function () {
//     initToggleSwitch();
// });

$(document).on('change', '.c-toggle-switch', function() {
    $(this).next('.toggleSwitchVal').val($(this).is(':checked'));
});

<!-- Image Preview -->
$(document).on('click', '.imagePreviewModel', function() {
    const el = $('#image_preview');
    const imageUrl = $(this).attr('src');
    el.find('img').attr('src', imageUrl);
    el.find('.addImgLink').attr('href', imageUrl);
    el.modal('show');
});
<!-- / Image Preview -->


<!-- Reset Hidden inputs -->
$('form').on('reset', function() {
  $("input[type='hidden']", $(this)).val('');
});
<!-- / Reset Hidden inputs -->
