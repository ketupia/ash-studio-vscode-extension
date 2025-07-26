defmodule Test do
  use Ash.Resource

  graphql do
    type(:track)
  end
end
