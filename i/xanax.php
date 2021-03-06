<?php
	/*
		This is a small API for ShareX in order to upload your images to your own domain.
	*/

	/*
		---CONFIG---
	*/
	//Security:
		$fileFormName = "file";
		$argumentName = "api_key";
		$argumentValue = "xXAlipoodleXx";

	//General:
		$domain = "https://alipoodle.me/i/"; //The URL to later echo back to ShareX. Don't forget the "/" in the end.
		$chars = 4; // Amount of characters filder&folder names should have. The more users you have, the higher the number should be.
		$namingMode = 3; /* Mode for generating folder&file names.
							1 - Generated names will consist of only numbers.
							2 - Generated names will consist of only lowercase letters.
							3 - Generated names will consist of lowercase letters and numbers.
						*/
		$generateFolders = 0; //If you enable this feature, URLS will consist of two random names
							  //(example: example.com/21321/23123.png), this is to prevent "random picture" generators.
							  //The feature works as a bool (0=off 1=on)
	/*
		---END OF CONFIG---
	*/

	function generateFolderName() {
		global $namingMode, $chars;
		$l = 'abcdefghijklmnopqrstuvwxyz';
		$n = '0123456789';

		if ($namingMode == 1) {
			$gf = substr(str_shuffle($n), 0, $chars);
		} else if ($namingMode == 2) {
			$gf = substr(str_shuffle($l), 0, $chars);
		} else if ($namingMode == 3) {
			$gf = substr(str_shuffle($n . $l), 0, $chars);
		}

		if (file_exists($gf . '/')) {
			return generateFolderName();
		} else {
			mkdir($gf, 0777);
			return $gf . '/';
		}
	}

	function generateFileName($name) {
		global $namingMode, $chars, $generateFolders;
		$l = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$n = '0123456789';

		if ($namingMode == 1) {
			$gn = substr(str_shuffle($n), 0, $chars) . '.' . end(explode(".",$name));
		} else if ($namingMode == 2) {
			$gn = substr(str_shuffle($l), 0, $chars) . '.' . end(explode(".",$name));
		} else if ($namingMode == 3) {
			$gn = substr(str_shuffle($n . $l), 0, $chars) . '.' . end(explode(".",$name));
		}

		if ($generateFolders == 0) {
			if (file_exists($gn)) {
				return generateFileName($name);
			} else {
				return $gn;
			}
		} else if ($generateFolders == 1) {
			return $gn;
		}
	}

	if (isset($_POST)) {
		if (is_uploaded_file($_FILES[$fileFormName]['tmp_name']) && $_POST[$argumentName] == $argumentValue) {
			$allowedExts = array("gif", "jpeg", "jpg", "png", "PNG", "JPG", "JPEG");
			$temp = explode(".", $_FILES[$fileFormName]["name"]);
			$extension = end($temp);
			if ((($_FILES[$fileFormName]["type"] == "image/gif")
			|| ($_FILES[$fileFormName]["type"] == "image/jpeg")
			|| ($_FILES[$fileFormName]["type"] == "image/jpg")
			|| ($_FILES[$fileFormName]["type"] == "image/pjpeg")
			|| ($_FILES[$fileFormName]["type"] == "image/x-png")
			|| ($_FILES[$fileFormName]["type"] == "image/png"))
			&& in_array($extension, $allowedExts)) {
				if ($_FILES[$fileFormName]["error"] > 0) {
					echo "An unexpected error happened.";
				} else {
					$un = generateFileName($_FILES[$fileFormName]['name']);
					global $domain;
					if ($generateFolders == 1) {
						$ud = generateFolderName();
						if (move_uploaded_file($_FILES[$fileFormName]["tmp_name"], $ud. $un)) {
							$url = $domain . $ud . $un;
							echo $url;
						} else {
							echo "An unexpected error happened.";
						}
					} else if ($generateFolders == 0) {
						if (move_uploaded_file($_FILES[$fileFormName]["tmp_name"], $un)) {
							$url = $domain . $un;
							echo $url;
						} else {
							echo "An unexpected error happened.";
						}
					}
				}
			} else {
				echo "File type not allowed.";
			}
		}
	}
?>
