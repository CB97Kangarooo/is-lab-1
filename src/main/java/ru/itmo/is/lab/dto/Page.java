package ru.itmo.is.lab.dto;

import java.util.List;

public class Page<T> {

    private List<T> items;
    private long total;

    public Page() {
    }

    public Page(List<T> items, long total) {
        this.items = items;
        this.total = total;
    }

    public List<T> getItems() { return items; }
    public void setItems(List<T> items) { this.items = items; }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
}
