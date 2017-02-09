<?php
############################################################################
#    PHP Upload Script for ShareX v2.0
#    Copyright (C) 2013 - 2015  Richard Cornwell
#    Website: http://thegeekoftheworld.com/
#    Script:  http://thegeekoftheworld.com/php-upload-script-for-sharex-v2
#    Email:   richard@techtoknow.net
#
#    This program is free software: you can redistribute it and/or
#    modify it under the terms of the GNU General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program. If not, see <http://www.gnu.org/licenses>.
############################################################################

$key = "RandomPass1337";
$redirect = "https://alipoodle.me";
$domain = "alipoodle.me";
$filenamelength = 5;

#Comment this next line if you want Robots to index this site.
if ($_SERVER["REQUEST_URI"] == "/robot.txt") { die("User-agent: *\nDisallow: /"); }


#Don't edit below this line inless you know what you are doing...
$urldata = explode("/", $_SERVER["REQUEST_URI"]);

function createthumb($name,$filename,$new_w,$new_h){
	$system=explode('.',$name);
	$src_img = imagecreatefromstring(file_get_contents($name));
	$old_x=imageSX($src_img);
	$old_y=imageSY($src_img);
	if ($old_x > $old_y) {
		$thumb_w=$new_w;
		$thumb_h=$old_y*($new_h/$old_x);
	}
	if ($old_x < $old_y) {
		$thumb_w=$old_x*($new_w/$old_y);
		$thumb_h=$new_h;
	}
	if ($old_x == $old_y) {
		$thumb_w=$new_w;
		$thumb_h=$new_h;
	}
	$dst_img=ImageCreateTrueColor($thumb_w,$thumb_h);
	imagecopyresampled($dst_img,$src_img,0,0,0,0,$thumb_w,$thumb_h,$old_x,$old_y); 
	if (preg_match("/png/",$system[1])){
		imagepng($dst_img,$filename); 
	} else {
		imagejpeg($dst_img,$filename); 
	}
	imagedestroy($dst_img); 
	imagedestroy($src_img); 
}

if (isset($urldata[1])) {
        if($urldata[1] == "tn") {
		if(!file_exists('tn_'.$urldata[2])) {
			createthumb($urldata[2],'tn_'.$urldata[2],100,100);
		}
        header('Location: http://'.$domain.'/tn_'.$urldata[2]);
		die();
	}
}

if (isset($urldata[1])) {
    if ($urldata[1] == $key) {
	header("Content-Type: application/json");
	if($urldata[2] == "upload") {
	        $target = getcwd() . "/" . basename($_FILES['d']['name']);
        	if (move_uploaded_file($_FILES['d']['tmp_name'], $target)) {

			$filename = substr(str_shuffle("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 0, $filenamelength).".".end(explode(".", $_FILES["d"]["name"]));
			while(file_exists($filename)) { $filename = substr(str_shuffle("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 0, $filenamelength).".".end(explode(".", $_FILES["d"]["name"])); }
       			rename(getcwd() . "/" . basename($_FILES['d']['name']), getcwd() . "/" . $filename);
			echo json_encode(array('filename' => $filename, 'key' => $key));
        	} else {
            		echo "Sorry, there was a problem uploading your file.";
        	}
	} elseif ($urldata[2] == "delete") {
		if (file_exists($urldata[3])) {
			if (isset($urldata[3])) {
				if(file_exists('tn_'.$urldata[3])) {
	                unlink('tn_'.$urldata[3]);
				}
				unlink($urldata[3]);
				echo "Your uploaded file has been deleted";
			} else { echo "Your file you want deleted does not exist"; }
		}
	}
} else {
	header('Location: '.$redirect);
}
} else {
	header('Location: '.$redirect);
}
?>