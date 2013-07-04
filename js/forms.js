$('#session-count').change(function() {
	var count = $('#session-count').val();
	$('#price').text('Pay $' + count + ".00");
});

function togglePassword() {
	var show = $('i#show-password');
	if (show.length > 0) {
		show.attr('id', 'hide-password').attr('class', 'icon-eye-open icon-3x');
		$('input#password').attr('type', 'text');
	} else {
		$('i#hide-password').attr('id', 'show-password').attr('class', 'icon-eye-close icon-3x');
		$('input#password').attr('type', 'password');
	}
}