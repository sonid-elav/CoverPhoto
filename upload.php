<?php 
	/*
		UI Service
	*/

	// class Lifekiyevent_Widget_ContentCover
	try {

			// Undefined | Multiple Files | $_FILES Corruption Attack
	    // If this request falls under any of them, treat it invalid.
	    /*
	    if (
	        !isset($_FILES['cover_photo']['error']) ||
	        is_array($_FILES['cover_photo']['error'])
	    ) {
	        throw new RuntimeException('Invalid parameters.');
	    }*/

	    if(!isset($_FILES['cover_photo'])) {
	    	throw new RuntimeException('No file');
	    }

	    // Check $_FILES['cover_photo']['error'] value.
	    switch ($_FILES['cover_photo']['error']) {
	        case UPLOAD_ERR_OK:
	            break;
	        case UPLOAD_ERR_NO_FILE:
	            throw new RuntimeException('No file sent.');
	        case UPLOAD_ERR_INI_SIZE:
	        case UPLOAD_ERR_FORM_SIZE:
	            throw new RuntimeException('Exceeded filesize limit.');
	        default:
	            throw new RuntimeException('Unknown errors.');
	    }

	    // You should also check filesize here. 
	    $MB = 1024 * 1024;
	    if ($_FILES['cover_photo']['size'] > 10 * $MB) {
	        throw new RuntimeException('Exceeded filesize limit.');
	    }

	    
		$mtype = $_FILES['cover_photo']['type'];

	    if (false === $ext = array_search($mtype, array(
	            'jpg' => 'image/jpeg',
	            'png' => 'image/png',
	            'gif' => 'image/gif',
	        ),
	        true
	    )) {
	        throw new RuntimeException('Invalid file format.');
	    }

	    // You should name it uniquely.
	    // DO NOT USE $_FILES['cover_photo']['name'] WITHOUT ANY VALIDATION !!
	    // On this example, obtain safe unique name from its binary data.
	    $dir = dirname(__FILE__) . '/uploads';
	    $filename = sprintf('%s.%s', sha1_file($_FILES['cover_photo']['tmp_name']), $ext);
	    $filetpl = $dir.'/'.$filename;

	    if ( !move_uploaded_file($_FILES['cover_photo']['tmp_name'], $filetpl) ) {
	        throw new RuntimeException('Failed to move uploaded file.');
	    }

	    $json['status'] = 'uploaded';
	    $json['url'] = 'uploads/'.$filename;
	} catch (Exception $ex) {
		$json['exception'] = $ex->getMessage();
		$json['request'] = $_REQUEST;
		$json['files'] = $_FILES;
		$json['type'] = $mtype;
	}

	sleep(5);

	$response = json_encode($json);

	header('Content-Type: text/html');
	//header('Content-Length: '.strlen($response));
	echo '<div>';
	echo $response;
	echo '</div>';
?>