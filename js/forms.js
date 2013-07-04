$('input#cc-num').payment('formatCardNumber');
$('input#cc-exp').payment('formatCardExpiry');
$('input#cc-cvc').payment('formatCardCVC');

$('select#session-count').change(function() {
	var count = $('#session-count').val();
	$('#submit-purchase').text('Pay $' + count + ".00");
});

$('form').submit(function(e) {
	e.preventDefault();
	$('input').removeClass('invalid');

	var cardType = $.payment.cardType($('.cc-num').val());
	$('.cc-num').toggleClass('invalid', 
		!$.payment.validateCardNumber($('.cc-num').val()));
    $('.cc-exp').toggleClass('invalid', 
    	!$.payment.validateCardExpiry($('.cc-exp').payment('cardExpiryVal')));
    $('.cc-cvc').toggleClass('invalid', 
    	!$.payment.validateCardCVC($('.cc-cvc').val(), cardType));
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