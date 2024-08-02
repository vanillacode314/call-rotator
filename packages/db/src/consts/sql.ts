const GET_NODES_BY_PATH_QUERY = (
	path: string,
	userId: number,
	includeChildren: boolean = false
) => {
	const query = `
	WITH RECURSIVE
	  CTE AS (
	    SELECT
	      id,
	      name AS parent_path
	    FROM
	      nodes
	    WHERE
	      parentId IS NULL
	      AND userId = __userid
				AND deleted = 0
	    UNION ALL
	    SELECT
	      n.id,
	      parent_path || '/' || n.name
	    FROM
	      nodes n
	      JOIN CTE ON n.parentId = CTE.id
	  ) __includeChildren
	`;

	path = path === '/' ? 'root' : 'root' + path;

	return query
		.replace(/__path/g, `'${path}'`)
		.replace(/__userid/g, `${userId}`)
		.replace(
			/__includeChildren/g,
			includeChildren
				? // with children
					`
				SELECT
				  *
				FROM
				  nodes
				WHERE
				  id = (
				    SELECT
				      id
				    FROM
				      CTE
				    WHERE
				      parent_path = __path AND deleted = 0
				  ) OR parentId = (
				    SELECT
				      id
				    FROM
				      CTE
				    WHERE
				      parent_path = __path AND deleted = 0
				  ) AND deleted = 0
					`.replace(/__path/g, `'${path}'`)
				: // no children
					`
				SELECT
				  *
				FROM
				  nodes
				WHERE
				  id = (
				    SELECT
				      id
				    FROM
				      CTE
				    WHERE
				      parent_path = __path AND deleted = 0
				  ) AND deleted = 0
				`.replace(/__path/g, `'${path}'`)
		);
};

export { GET_NODES_BY_PATH_QUERY };
