defmodule Specification do
  use Ash.Resource,
    domain: Domain,
    data_layer: Ash.DataLayer.Ets,
    extensions: [AshOutstanding.Resource]

  outstanding do
    expect([:name, :major_version, :version])

    customize(fn outstanding, expected, _actual ->
      case outstanding do
        nil ->
          outstanding

        %_{} ->
          outstanding
          |> Map.put(:id, expected.id)
      end
    end)
  end

  actions do
    defaults([:read, :destroy, create: :*, update: :*])
  end

  attributes do
    uuid_primary_key(:id, writable?: true)
    attribute(:href, :string, public?: true)
    attribute(:name, :string, public?: true)
    attribute(:major_version, :integer, public?: true)
    attribute(:version, :string, public?: true)

    attribute :category, :union do
      constraints(
        types: [
          string: [type: :string],
          atom: [type: :atom],
          function: [type: :function]
        ]
      )
    end
  end

  calculations do
    calculate(:is_outstanding_major_version, :boolean, expr(is_outstanding(2, major_version)))
    calculate(:outstanding_major_version, :term, expr(outstanding(2, major_version)))
  end
end
