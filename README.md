# How-Can-I-add-Email-Verification-Functions-For-WooCommerce


You'll need an empty page with the URL yoursite.com/verify/ that builds on a template that contains <?php wc_print_notices(); ?> within its content container. It'll replace the /sign-in/ destination from the original code and will handle almost all messages created by this code.

Next, add this code to your theme's functions.php:


now check funtion.php file >>>> 




or  If you are running a multilingual site, you can make the code translation-ready very easily. Just change the text strings like this: __( 'Text you want to translate', 'your-theme' ) This allows translation plugins like WPML to add the string to a translation table in the your-theme text domain.

Note that any string containing a variable like .$url. will generate a new string every time a different user activates its function. To circumvent this (and prevent string spamming into your database), we can translate them directly in the code:


if(ICL_LANGUAGE_CODE=='de'){
    wc_add_notice( __( 'German error message' ), 'error' );
} else {
    wc_add_notice( __( 'English error message' ), 'error' );
}


In this example, the german message will be output if the user's language code is detected as de (Also works if it is a variation like de_DE_formal), else it will output the english message.
