// Universele datumfilter-checker voor al je modules
export function checkDateFilter(itemDateString, filterType, filterValue) {
    if (!itemDateString) return false;
    const itemDate = new Date(itemDateString);
    const now = new Date();

    if (filterType === 'all') return true;

    if (filterType === 'today') {
        return itemDate.toDateString() === now.toDateString();
    }

    if (filterType === 'week') {
        // Bereken of datum in dezelfde week valt
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Maandag start
        startOfWeek.setHours(0,0,0,0);
        return itemDate >= startOfWeek;
    }

    if (filterType === 'month') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }

    if (filterType === 'year') {
        return itemDate.getFullYear() === now.getFullYear();
    }

    // Specifieke selecties (filterValue heeft bijvoorbeeld de vorm "2026-W18", "2026-05", "2026-05-15", of "2026")
    if (filterType === 'specific_day' && filterValue) {
        return itemDate.toISOString().slice(0, 10) === filterValue;
    }

    if (filterType === 'specific_month' && filterValue) {
        // filterValue is "YYYY-MM"
        const itemMonthStr = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
        return itemMonthStr === filterValue;
    }

    if (filterType === 'specific_year' && filterValue) {
        return itemDate.getFullYear().toString() === filterValue.toString();
    }

    if (filterType === 'specific_week' && filterValue) {
        // filterValue is "YYYY-Www" - we kunnen dit mappen op basis van getWeek()
        // (Dit werken we straks per component strak uit)
        return true; 
    }

    return true;
}
