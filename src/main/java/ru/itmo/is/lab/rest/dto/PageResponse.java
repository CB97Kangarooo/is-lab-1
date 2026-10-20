package ru.itmo.is.lab.rest.dto;

import ru.itmo.is.lab.dto.Page;

import java.util.List;

/**
 * Страница списка для REST: {@code {items, total, offset, limit}}.
 */
public class PageResponse<T> {

    private List<T> items;
    private long total;
    private int offset;
    private int limit;

    public PageResponse() {
    }

    public static <T> PageResponse<T> of(Page<T> page, int offset, int limit) {
        PageResponse<T> response = new PageResponse<>();
        response.items = page.getItems();
        response.total = page.getTotal();
        response.offset = offset;
        response.limit = limit;
        return response;
    }

    public List<T> getItems() { return items; }
    public void setItems(List<T> items) { this.items = items; }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public int getOffset() { return offset; }
    public void setOffset(int offset) { this.offset = offset; }

    public int getLimit() { return limit; }
    public void setLimit(int limit) { this.limit = limit; }
}
