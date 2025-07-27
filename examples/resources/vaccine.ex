defmodule Whodapet.Vaccinations.Vaccine do
  @moduledoc """
  Vaccines that can be given to pets
  """

  use Ash.Resource,
    data_layer: AshPostgres.DataLayer,
    domain: Whodapet.Vaccinations,
    notifiers: [Ash.Notifier.PubSub],
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshAdmin.Resource]

  admin do
    actor? false
    table_columns [:manufacturer, :product_name, :duration, :species]
    update_actions [:edit]
    create_actions [:new]
  end

  postgres do
    table "vaccines"
    repo Whodapet.Repo
  end

  actions do
    defaults [:read, :destroy, create: :*, update: :*]

    read :for_species do
      argument :species, :atom, allow_nil?: false
      filter expr(^arg(:species) in species)
    end

    create :new do
      upsert? true
      upsert_identity :unique_manufacturer_product_name
      upsert_fields [:manufacturer, :product_name]

      accept [
        :manufacturer,
        :product_name,
        :duration,
        :species
      ]
    end

    update :edit do
      accept [
        :manufacturer,
        :product_name,
        :duration,
        :species
      ]
    end
  end

  policies do
    bypass actor_attribute_equals(:site_role, :admin) do
      authorize_if always()
    end

    policy action_type(:read) do
      authorize_if always()
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :manufacturer, :string,
      allow_nil?: false,
      constraints: [trim?: true, allow_empty?: false]

    attribute :product_name, :string,
      allow_nil?: false,
      constraints: [trim?: true, allow_empty?: false]

    attribute :duration, :integer, allow_nil?: false, constraints: [min: 1]

    attribute :species, {:array, :atom}, allow_nil?: false, default: []

    timestamps()
  end

  calculations do
    calculate :display_name,
              :string,
              expr(
                "#{manufacturer} #{product_name} - #{duration} year#{if duration == 1, do: "", else: "s"}"
              )
  end

  identities do
    identity :unique_manufacturer_product_name, [:manufacturer, :product_name]
  end
end
