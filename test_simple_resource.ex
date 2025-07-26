defmodule TestApp.SimpleResource do
  use Ash.Resource

  attributes do
    uuid_primary_key(:id)
    attribute(:name, :string)
    attribute(:email, :string)
  end

  actions do
    defaults([:read, :create, :update, :destroy])
  end
end
