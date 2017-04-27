package eu.daiad.web.model.report;

import org.joda.time.DateTime;

import eu.daiad.web.model.RestResponse;

public class ReportStatusResponse extends RestResponse {

    private ReportStatus status;

    public ReportStatusResponse(DateTime createdOn, long size, String url, int year, int month) {
        super();

        status = new ReportStatus(createdOn, size, url, year, month);
    }

    public ReportStatus getStatus() {
        return status;
    }

}
