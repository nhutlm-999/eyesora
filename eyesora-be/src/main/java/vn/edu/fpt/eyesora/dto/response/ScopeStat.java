package vn.edu.fpt.eyesora.dto.response;

import java.util.List;

public record ScopeStat(
        String scopeName,
        long count,
        long total,
        double rate,
        String listFilter
) {}
