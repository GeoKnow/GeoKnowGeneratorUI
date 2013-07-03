#
# Regular cron jobs for the geoknow-generator-ui package
#
0 4	* * *	root	[ -x /usr/bin/geoknow-generator-ui_maintenance ] && /usr/bin/geoknow-generator-ui_maintenance
