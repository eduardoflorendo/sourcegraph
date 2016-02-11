package pgsql

import (
	"testing"

	"golang.org/x/net/context"

	"src.sourcegraph.com/sourcegraph/go-sourcegraph/sourcegraph"
)

func (s *repos) mustCreate(ctx context.Context, t *testing.T, repos ...*sourcegraph.Repo) []*sourcegraph.Repo {
	var createdRepos []*sourcegraph.Repo
	for _, repo := range repos {
		repo.VCS = "git"

		if err := s.Create(ctx, repo); err != nil {
			t.Fatal(err)
		}
		repo, err := s.Get(ctx, repo.URI)
		if err != nil {
			t.Fatal(err)
		}
		createdRepos = append(createdRepos, repo)
	}
	return createdRepos
}

func TestRepos_List_byOwner_empty(t *testing.T) {
	var s repos

	testUserSpec := sourcegraph.UserSpec{Login: "alice"}

	repos, err := s.List(context.Background(), &sourcegraph.RepoListOptions{Owner: testUserSpec.SpecString()})
	if err != nil {
		t.Fatal(err)
	}
	if len(repos) != 0 {
		t.Errorf("got repos == %v, want empty", repos)
	}
}
