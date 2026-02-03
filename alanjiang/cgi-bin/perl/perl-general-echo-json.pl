#!/usr/bin/perl
use JSON;

print "Cache-Control: no-cache\n";
print "Content-type: application/json\n\n";

my $date = localtime();
my $ip = $ENV{REMOTE_ADDR};
my $hostname = $ENV{HTTP_HOST};
my $agent_header = $ENV{HTTP_USER_AGENT};
my $method = $ENV{HTTP_X_HTTP_METHOD_OVERRIDE} || $ENV{REQUEST_METHOD} || 'GET';
$method = uc($method);
my $protocol = $ENV{SERVER_PROTOCOL};
my $query_string = $ENV{QUERY_STRING};

my $formdata = "";
if ($ENV{REQUEST_METHOD} ne 'GET'){
    read(STDIN, $form_data, $ENV{CONTENT_LENGTH});
}
my %response = (
    hostname => $hostname,
    datetime => $date,
    user_agent => $agent_header,
    ip_address => $ip,
    http_method => $method,
    protocol => $protocol,
    query_string => $query_string,
    message_body => $form_data
);

print encode_json(\%response);