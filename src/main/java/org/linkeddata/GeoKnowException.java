package org.linkeddata;

import java.lang.Exception;

class GeoKnowException extends Exception {

    GeoKnowException() {
    };

	public GeoKnowException(String msg){
		super(msg);
		}

    GeoKnowException(String msg, Exception e) {
        super(msg + e.getMessage());
    };
}
