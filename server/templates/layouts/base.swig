{#
  Base template
  All other templates should extend from this
#}

{# [injector:swig] #}
{# [endinjector] #}

<!DOCTYPE html>
<!--[if lte IE 8]><html class="lt-ie9 no-js" lang="en"><![endif]-->
<!--[if gt IE 8]><!--><html lang="en" class="ie9 no-js"><!--<![endif]-->
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <title>erate-cycle-api</title>
    <meta name="description" content=""/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="csrf-token" content="{{_csrf}}" />

    {% if env == 'development' %}
    <!-- build:css(client) styles/global.css -->
      <!-- bower:css -->
      <link rel="stylesheet" href="/bower_components/normalize.css/normalize.css" />
      <!-- endbower -->
    <!-- endbuild -->
    {% else %}
    <link rel="stylesheet" href="/styles/global.css" />
    {% endif %}

    <link rel="stylesheet" href="/styles/main.css">

    {% if env == 'development' %}
    <!-- build:js(client) scripts/modernizr.js -->
    <script src="/bower_components/modernizr/modernizr.js"></script>
    <!-- endbuild -->
    {% else %}
    <script src="/scripts/modernizr.js"></script>
    {% endif %}

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- build:js(client) scripts/shims.js -->
    <!--[if lt IE 9]>
    <script src="/bower_components/consolelog/consolelog.js"></script>
    <script src="/bower_components/html5shiv/dist/html5shiv-printshiv.js"></script>
    <![endif]-->
    <!-- endbuild -->
  </head>
  <body>
    <!--[if lte IE 7]>
    <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
    <![endif]-->

    {% block layout %}
    {% block content %}{% endblock %}
    {% endblock %}

    {% if env == 'development' %}
    <!-- build:js(client) scripts/global.js -->
      <!-- bower:js -->
      <script src="/bower_components/jquery/dist/jquery.js"></script>
      <!-- endbower -->
    <!-- endbuild -->
    {% else %}
    <script src="/scripts/global.js"></script>
    {% endif %}

    <!-- build:js(client) scripts/main.js -->
      <!-- [injector:js] -->
      <!-- [endinjector] -->
    <script src="/scripts/main.js"></script>
    <!-- endbuild -->
  </body>
</html>
