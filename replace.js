module.exports = [
  {
    source: "INSERT INTO accounts",
    output:
      'INSERT INTO public.accounts (id, "accountID", name, balance_current, balance_available, balance_limit, mask, official_name, type, subtype, bank, offbudget, closed, tombstone)',
  },
  {
    source: "INSERT INTO category_groups",
    output:
      "INSERT INTO public.groups (id, name, is_income, sort_order, tombstone)",
  },
  {
    source: "INSERT INTO categories",
    output:
      'INSERT INTO public.categories (id, name, is_income, "groupID", sort_order, tombstone)',
  },
  {
    source: "INSERT INTO payees",
    output:
      'INSERT INTO public.payees (id, name, "categoryID", tombstone, "accountID")',
  },
  {
    source: "INSERT INTO transactions",
    output:
      'INSERT INTO public.transactions (id, isparent, ischild, "accountID", "categoryID", amount, "payeeID", notes, date, financial_id, type, location, error, imported_description, starting_balance_flag, "transferredID", sort_order, tombstone, cleared, pending)',
  },
];
