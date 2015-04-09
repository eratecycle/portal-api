<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta name="viewport" content="width=device-width" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Actionable emails e.g. reset password</title>
  <link href="http://www.eratecycle.com/portal.css" media="all" rel="stylesheet" type="text/css" />
</head>

<body>

  <table class="body-wrap">
    <tr>
      <td></td>
      <td class="container" width="600">
        <div class="content">
          <table class="main" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td class="content-wrap">
                <table  cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <img class="img-responsive" src="img/header.jpg"/>
                    </td>
                  </tr>
                  <tr>
                    <td class="content-block">
                      <h3>{{subject}}</h3>
                    </td>
                  </tr>
                  <tr>
                    <td class="content-block">
                      <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
                      <p>Please click on the following link, or paste this into your browser to complete the process:<br/>
                      {{ siteURL }}/reset/?id={{token}}</p>
                      <p>If you did not request this, please ignore this email and your password will remain unchanged.<p/>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <div class="footer">
            <table width="100%">
              <tr>
                <td class="aligncenter content-block">Follow <a href="#">@Company</a> on Twitter.</td>
              </tr>
            </table>
          </div></div>
        </td>
        <td></td>
      </tr>
    </table>

  </body>
  </html>
