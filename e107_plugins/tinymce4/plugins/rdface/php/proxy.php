<?php
$api = $_POST['api'];
$confidence = $_POST['confidence'];
$language = $_POST['language'];
if(!$api){die("You must specify an API name!");}
$request_body = stripslashes($_POST['query']);
$additionals=null;
if($api == "DBpedia"){
  $url = "http://api.dbpedia-spotlight.org/".$language."/annotate";
  $request = "text=".urlencode($request_body)."&confidence=".$_POST['confidence']."&support=20";
  $additionals = array(
    CURLOPT_HTTPHEADER => array("Content-Type:application/x-www-form-urlencoded", "Accept: application/json"),
    CURLOPT_POST => 1,
    CURLOPT_POSTFIELDS => $request,
    CURLOPT_SSL_VERIFYPEER => 0
  );
}elseif($api == "MeaningCloud"){
	$token = "";
	$url = "https://api.meaningcloud.com/topics-2.0";
	$input =  http_build_query(array("txt" => $request_body, "key" => $token, "lang" => $language, "ilang" => $language, "tt" => "ectmnoqra"));
	$additionals=array(
    CURLOPT_HTTPHEADER => array("content-type:application/x-www-form-urlencoded", "outputFormat:application/json"),
    CURLOPT_POST => 1,
    CURLOPT_POSTFIELDS => $input,
    CURLOPT_SSL_VERIFYPEER => 0
	);
}elseif($api == "EventRegistry"){
	$token="&apiKey=";
	$url="http://analytics.eventregistry.org/api/v1/annotate?";
	$parm = "minLinkFrequency=3&minLinkRelFrequency=0.01&nTopDfWordsToIgnore=200&minPMentionGivenPhrase=0.03&pageRankSqThreshold=0.95&applyPageRankSqThreshold=true&text=";
  $parm .= urlencode($request_body);
  $url .= $parm.$token;
	$additionals=array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_HEADER => false,
    CURLOPT_URL => $url,
    CURLOPT_SSL_VERIFYPEER => 0
  );
}elseif($api == "Dandelion"){
	$token="&token=";
	$url="https://api.dandelion.eu/datatxt/nex/v1/?";
	$parm = "min_confidence=".$confidence."&text=";
  $parm .= urlencode($request_body);
  $parm .= "&country=-1&lang=".$language."&social=False&top_entities=8&include=image%2Cabstract%2Ctypes%2Ccategories%2Clod";
  $url .= $parm.$token;
	$additionals = array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_HEADER => false,
    CURLOPT_URL => $url,
    CURLOPT_SSL_VERIFYPEER => 0
  );
}

$session = curl_init($url);
if($additionals){
	foreach ($additionals as $key => $value){
		curl_setopt($session, $key, $value);
	}
}
curl_setopt ($session, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec ($session);
curl_close ($session);
echo $response;
?>

