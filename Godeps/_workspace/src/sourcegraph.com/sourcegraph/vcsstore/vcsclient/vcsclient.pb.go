// Code generated by protoc-gen-gogo.
// source: vcsclient.proto
// DO NOT EDIT!

/*
Package vcsclient is a generated protocol buffer package.

It is generated from these files:
	vcsclient.proto

It has these top-level messages:
	FileRange
	GetFileOptions
	TreeEntry
*/
package vcsclient

import proto "github.com/gogo/protobuf/proto"

// discarding unused import gogoproto "github.com/gogo/protobuf/gogoproto/gogo.pb"
import pbtypes "sourcegraph.com/sqs/pbtypes"

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal

type TreeEntryType int32

const (
	FileEntry    TreeEntryType = 0
	DirEntry     TreeEntryType = 1
	SymlinkEntry TreeEntryType = 2
)

var name = map[int32]string{
	0: "FileEntry",
	1: "DirEntry",
	2: "SymlinkEntry",
}
var value = map[string]int32{
	"FileEntry":    0,
	"DirEntry":     1,
	"SymlinkEntry": 2,
}

func (x TreeEntryType) String() string {
	return proto.EnumName(name, int32(x))
}

// FileRange is a line and byte range in a file.
type FileRange struct {
	// start of line range
	StartLine int64 `protobuf:"varint,1,opt,name=start_line,proto3" json:"start_line,omitempty" url:",omitempty"`
	// end of line range
	EndLine int64 `protobuf:"varint,2,opt,name=end_line,proto3" json:"end_line,omitempty" url:",omitempty"`
	// start of byte range
	StartByte int64 `protobuf:"varint,3,opt,name=start_byte,proto3" json:"start_byte,omitempty" url:",omitempty"`
	// end of byte range
	EndByte int64 `protobuf:"varint,4,opt,name=end_byte,proto3" json:"end_byte,omitempty" url:",omitempty"`
}

func (m *FileRange) Reset()         { *m = FileRange{} }
func (m *FileRange) String() string { return proto.CompactTextString(m) }
func (*FileRange) ProtoMessage()    {}

// GetFileOptions specifies options for GetFileWithOptions.
type GetFileOptions struct {
	// line or byte range to fetch (can't set both line *and* byte range)
	FileRange `protobuf:"bytes,1,opt,name=file_range,embedded=file_range" json:"file_range"`
	// EntireFile is whether the entire file contents should be returned. If true,
	// Start/EndLine and Start/EndBytes are ignored.
	EntireFile bool `protobuf:"varint,2,opt,name=entire_file,proto3" json:"entire_file,omitempty" url:",omitempty"`
	// ExpandContextLines is how many lines of additional output context to include (if
	// Start/EndLine and Start/EndBytes are specified). For example, specifying 2 will
	// expand the range to include 2 full lines before the beginning and 2 full lines
	// after the end of the range specified by Start/EndLine and Start/EndBytes.
	ExpandContextLines int32 `protobuf:"varint,3,opt,name=expand_context_lines,proto3" json:"expand_context_lines,omitempty" url:",omitempty"`
	// FullLines is whether a range that includes partial lines should be extended to
	// the nearest line boundaries on both sides. It is only valid if StartByte and
	// EndByte are specified.
	FullLines bool `protobuf:"varint,4,opt,name=full_lines,proto3" json:"full_lines,omitempty" url:",omitempty"`
	// Recursive only applies if the returned entry is a directory. It will
	// return the full file tree of the host repository, recursing into all
	// sub-directories.
	Recursive bool `protobuf:"varint,5,opt,name=recursive,proto3" json:"recursive,omitempty" url:",omitempty"`
	// RecurseSingleSubfolder only applies if the returned entry is a directory.
	// It will recursively find and include all sub-directories with a single sub-directory.
	RecurseSingleSubfolder bool `protobuf:"varint,6,opt,name=recurse_single_subfolder,proto3" json:"recurse_single_subfolder,omitempty" url:",omitempty"`
}

func (m *GetFileOptions) Reset()         { *m = GetFileOptions{} }
func (m *GetFileOptions) String() string { return proto.CompactTextString(m) }
func (*GetFileOptions) ProtoMessage()    {}

type TreeEntry struct {
	Name     string            `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	Type     TreeEntryType     `protobuf:"varint,2,opt,name=type,proto3,enum=vcsclient.TreeEntryType" json:"type,omitempty"`
	Size     int64             `protobuf:"varint,3,opt,name=size,proto3" json:"size,omitempty"`
	ModTime  pbtypes.Timestamp `protobuf:"bytes,4,opt,name=mod_time" json:"mod_time"`
	Contents []byte            `protobuf:"bytes,5,opt,name=contents,proto3" json:"contents,omitempty"`
	Entries  []*TreeEntry      `protobuf:"bytes,6,rep,name=entries" json:"entries,omitempty"`
}

func (m *TreeEntry) Reset()         { *m = TreeEntry{} }
func (m *TreeEntry) String() string { return proto.CompactTextString(m) }
func (*TreeEntry) ProtoMessage()    {}

func (m *TreeEntry) GetModTime() pbtypes.Timestamp {
	if m != nil {
		return m.ModTime
	}
	return pbtypes.Timestamp{}
}

func (m *TreeEntry) GetEntries() []*TreeEntry {
	if m != nil {
		return m.Entries
	}
	return nil
}

func init() {
	proto.RegisterEnum("vcsclient.TreeEntryType", name, value)
}
