function hdcpCheck()
{
  var on = $('#input_dhcp_on').prop("checked");
  if (!on)
  {
    $('#input_ip_address').prop('disabled',false);
    $('#input_mask_address').prop('disabled',false);
    $('#input_gateway_address').prop('disabled',false);
    $('#input_dns_address').prop('disabled',false);
  } else {
    $('#input_ip_address').prop('disabled',true);
    $('#input_mask_address').prop('disabled',true);
    $('#input_gateway_address').prop('disabled',true);
    $('#input_dns_address').prop('disabled',true);
  }
}

function init()
{
    hdcpCheck();
}
