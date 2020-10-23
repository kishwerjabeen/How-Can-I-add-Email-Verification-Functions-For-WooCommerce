function wc_registration_redirect( $redirect_to ) {     // prevents the user from logging in automatically after registering their account
    wp_logout();
    wp_redirect( '/verify/?n=');                        // redirects to a confirmation message
    exit;
}

function wp_authenticate_user( $userdata ) {            // when the user logs in, checks whether their email is verified
    $has_activation_status = get_user_meta($userdata->ID, 'is_activated', false);
    if ($has_activation_status) {                           // checks if this is an older account without activation status; skips the rest of the function if it is
        $isActivated = get_user_meta($userdata->ID, 'is_activated', true);
        if ( !$isActivated ) {
            my_user_register( $userdata->ID );              // resends the activation mail if the account is not activated
            $userdata = new WP_Error(
                'my_theme_confirmation_error',
                __( '<strong>Error:</strong> Your account has to be activated before you can login. Please click the link in the activation email that has been sent to you.<br /> If you do not receive the activation email within a few minutes, check your spam folder or <a href="/verify/?u='.$userdata->ID.'">click here to resend it</a>.' )
            );
        }
    }
    return $userdata;
}

function my_user_register($user_id) {               // when a user registers, sends them an email to verify their account
    $user_info = get_userdata($user_id);                                            // gets user data
    $code = md5(time());                                                            // creates md5 code to verify later
    $string = array('id'=>$user_id, 'code'=>$code);                                 // makes it into a code to send it to user via email
    update_user_meta($user_id, 'is_activated', 0);                                  // creates activation code and activation status in the database
    update_user_meta($user_id, 'activationcode', $code);
    $url = get_site_url(). '/verify/?p=' .base64_encode( serialize($string));       // creates the activation url
    $html = ( 'Please click <a href="'.$url.'">here</a> to verify your email address and complete the registration process.' ); // This is the html template for your email message body
    wc_mail($user_info->user_email, __( 'Activate your Account' ), $html);          // sends the email to the user
}

function my_init(){                                 // handles all this verification stuff
    if(isset($_GET['p'])){                                                  // If accessed via an authentification link
        $data = unserialize(base64_decode($_GET['p']));
        $code = get_user_meta($data['id'], 'activationcode', true);
        $isActivated = get_user_meta($data['id'], 'is_activated', true);    // checks if the account has already been activated. We're doing this to prevent someone from logging in with an outdated confirmation link
        if( $isActivated ) {                                                // generates an error message if the account was already active
            wc_add_notice( __( 'This account has already been activated. Please log in with your username and password.' ), 'error' );
        }
        else {
            if($code == $data['code']){                                     // checks whether the decoded code given is the same as the one in the data base
                update_user_meta($data['id'], 'is_activated', 1);           // updates the database upon successful activation
                $user_id = $data['id'];                                     // logs the user in
                $user = get_user_by( 'id', $user_id ); 
                if( $user ) {
                    wp_set_current_user( $user_id, $user->user_login );
                    wp_set_auth_cookie( $user_id );
                    do_action( 'wp_login', $user->user_login, $user );
                }
                wc_add_notice( __( '<strong>Success:</strong> Your account has been activated! You have been logged in and can now use the site to its full extent.' ), 'notice' );
            } else {
                wc_add_notice( __( '<strong>Error:</strong> Account activation failed. Please try again in a few minutes or <a href="/verify/?u='.$userdata->ID.'">resend the activation email</a>.<br />Please note that any activation links previously sent lose their validity as soon as a new activation email gets sent.<br />If the verification fails repeatedly, please contact our administrator.' ), 'error' );
            }
        }
    }
    if(isset($_GET['u'])){                                          // If resending confirmation mail
        my_user_register($_GET['u']);
        wc_add_notice( __( 'Your activation email has been resent. Please check your email and your spam folder.' ), 'notice' );
    }
    if(isset($_GET['n'])){                                          // If account has been freshly created
        wc_add_notice( __( 'Thank you for creating your account. You will need to confirm your email address in order to activate your account. An email containing the activation link has been sent to your email address. If the email does not arrive within a few minutes, check your spam folder.' ), 'notice' );
    }
}

// the hooks to make it all work
add_action( 'init', 'my_init' );
add_filter('woocommerce_registration_redirect', 'wc_registration_redirect');
add_filter('wp_authenticate_user', 'wp_authenticate_user',10,2);
add_action('user_register', 'my_user_register',10,2);
