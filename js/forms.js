$('input#cc-num').payment('formatCardNumber');
$('input#cc-exp').payment('formatCardExpiry');
$('input#cc-cvc').payment('formatCardCVC');

$('select#session-count').change(function() {
	var count = $('#session-count').val();
	$('#submit-purchase').attr('value', 'Pay $' + count + ".00");
});

$('#payment-form').submit(function(e) {
	e.preventDefault();
	$('input').removeClass('invalid');

	var cardType = $.payment.cardType($('#cc-num').val());
	$('#cc-num').toggleClass('invalid', 
		!$.payment.validateCardNumber($('#cc-num').val()));

	if ($.payment.validateCardExpiry($('#cc-exp').payment('cardExpiryVal'))) {
		$('#cc-exp').toggleClass('invalid', false);
		var exp = $('#cc-exp').payment('cardExpiryVal');
		$('#cc-month').val(exp.month);
		$('#cc-year').val(exp.year);
	} else {
		$('#cc-exp').toggleClass('invalid', true);
	}

    $('#cc-cvc').toggleClass('invalid', 
    	!$.payment.validateCardCVC($('#cc-cvc').val(), cardType));

    var $form = $(this);
    $('#submit-purchase').prop('disabled', true);
    Stripe.createToken($form, formRespHandler);
    return false;
});

var formRespHandler = function(status, resp) {
	var $form = $('#payment-form');
	if (resp.error) {
		$form.find('#payment-errors')
			 .attr('class', 'span6 alert alert-error')
			 .text(resp.error.message);

		$('#submit-purchase').prop('disabled', false);
	} else {
		var token = resp.id;
		$form.append($('<input type="hidden" name="purchaseToken" />').val(token));
		$form.get(0).submit();
	}
}

var togglePassword = function () {
	var show = $('i#show-password');
	if (show.length > 0) {
		show.attr('id', 'hide-password').attr('class', 'icon-eye-open icon-3x');
		$('input#password').attr('type', 'text');
	} else {
		$('i#hide-password').attr('id', 'show-password').attr('class', 'icon-eye-close icon-3x');
		$('input#password').attr('type', 'password');
	}
}